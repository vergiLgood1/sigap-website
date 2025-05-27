// detect-face/index.ts
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { RekognitionClient, DetectFacesCommand } from "npm:@aws-sdk/client-rekognition@^3.0.0";
import {
  validateAWSCredentials,
  validateFile,
  createErrorResponse,
  createSuccessResponse,
  type AWSCredentials
} from "../shared/aws-utils.ts";

interface DetectFaceResponse {
  success: true;
  faceDetails: any[];
  count: number;
  imageSize?: number;
  processingTime?: number;
}

// Configuration constants
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Logger utility for structured logs
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] [detect-face] ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] [detect-face] ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] [detect-face] ${message}`, error ? error : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG] [${new Date().toISOString()}] [detect-face] ${message}`, data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(`[SUCCESS] [${new Date().toISOString()}] [detect-face] ${message}`, data ? data : '');
  }
};

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logger.info(`Starting face detection request [ID: ${requestId}]`);

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      logger.warn(`Invalid HTTP method ${req.method} [ID: ${requestId}]`);
      return createErrorResponse('Method not allowed. Use POST', 405);
    }

    // Validate AWS credentials
    logger.debug(`Validating AWS credentials [ID: ${requestId}]`);
    const { credentials, error: credError } = validateAWSCredentials();
    if (credError || !credentials) {
      logger.error(`AWS credentials validation failed [ID: ${requestId}]`, credError);
      return createErrorResponse(credError || 'AWS credentials not configured');
    }

    logger.debug(`AWS Region: ${credentials.region} [ID: ${requestId}]`);

    // Initialize Rekognition client
    logger.debug(`Initializing Rekognition client [ID: ${requestId}]`);
    const rekognitionClient = new RekognitionClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey
      }
    });

    // Parse multipart form data
    logger.debug(`Parsing form data [ID: ${requestId}]`);
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      logger.error(`Failed to parse form data [ID: ${requestId}]`, error);
      return createErrorResponse('Invalid form data. Expected multipart/form-data', 400);
    }

    // Get and validate image file
    const image = formData.get('image') as File | null;
    logger.debug(`Validating image [ID: ${requestId}]`);
    const validation = validateFile(image, 'image');

    if (!validation.isValid) {
      logger.warn(`Image validation failed [ID: ${requestId}]`, validation.error);
      return createErrorResponse(validation.error || 'Invalid image file', 400);
    }

    logger.info(`Processing image [ID: ${requestId}]`, {
      name: image!.name,
      size: `${(image!.size / 1024).toFixed(2)} KB`,
      type: image!.type
    });

    // Convert image to Uint8Array
    logger.debug(`Converting image to binary format [ID: ${requestId}]`);
    let imageBytes: Uint8Array;
    try {
      imageBytes = await fileToUint8Array(image!);
    } catch (error) {
      logger.error(`Failed to convert image to bytes [ID: ${requestId}]`, error);
      return createErrorResponse('Failed to process image data', 500);
    }

    // Create DetectFaces command
    logger.info(`Sending request to AWS Rekognition DetectFaces [ID: ${requestId}]`);
    const detectFacesCommand = new DetectFacesCommand({
      Image: {
        Bytes: imageBytes
      },
      Attributes: ["ALL"]
    });

    // Execute AWS Rekognition request
    let rekognitionResponse: any;
    try {
      rekognitionResponse = await rekognitionClient.send(detectFacesCommand);
    } catch (error) {
      logger.error(`AWS Rekognition request failed [ID: ${requestId}]`, error);

      // Handle specific AWS errors
      if (error.name === 'InvalidImageFormatException') {
        return createErrorResponse('Invalid image format. Please use JPEG or PNG format', 400);
      } else if (error.name === 'ImageTooLargeException') {
        return createErrorResponse('Image too large. Please reduce image size', 400);
      } else if (error.name === 'InvalidParameterException') {
        return createErrorResponse('Invalid parameters provided', 400);
      } else if (error.name === 'InvalidS3ObjectException') {
        return createErrorResponse('Invalid image data', 400);
      }

      return createErrorResponse('Failed to analyze image with AWS Rekognition', 500);
    }

    const processingTime = Date.now() - startTime;
    const faceCount = (rekognitionResponse.FaceDetails || []).length;

    logger.success(`Face detection completed [ID: ${requestId}]`, {
      facesDetected: faceCount,
      processingTime: `${processingTime}ms`,
      imageSize: `${(image!.size / 1024).toFixed(2)} KB`
    });

    // Log detailed face information if faces are detected
    if (faceCount > 0) {
      const faceDetails = rekognitionResponse.FaceDetails.map((face: any, index: number) => {
        return {
          faceIndex: index + 1,
          ageRange: face.AgeRange ? `${face.AgeRange.Low}-${face.AgeRange.High}` : 'Unknown',
          gender: face.Gender ? `${face.Gender.Value} (${face.Gender.Confidence.toFixed(2)}%)` : 'Unknown',
          emotions: face.Emotions ?
            face.Emotions.map((e: any) => `${e.Type}(${e.Confidence.toFixed(2)}%)`).join(', ') :
            'None detected',
          quality: face.Quality ?
            `Brightness=${face.Quality.Brightness.toFixed(2)}, Sharpness=${face.Quality.Sharpness.toFixed(2)}` :
            'Unknown'
        };
      });

      logger.info(`Face details [ID: ${requestId}]`, { faces: faceDetails });
    } else {
      logger.info(`No faces detected in image [ID: ${requestId}]`);
    }

    // Prepare response
    const response: DetectFaceResponse = {
      success: true,
      faceDetails: rekognitionResponse.FaceDetails || [],
      count: faceCount,
      imageSize: image!.size,
      processingTime
    };

    return createSuccessResponse(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(`Unexpected error in detect-face function [ID: ${requestId}]`, error);
    logger.error(`Processing time before error: ${processingTime}ms [ID: ${requestId}]`);

    return createErrorResponse(
      "An unexpected error occurred while processing the image",
      500
    );
  }
});

/* 
To invoke locally:

1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
2. Make an HTTP request:

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/detect-face' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
  --form 'image=@"path/to/your/image.jpg"'

Example response:
{
  "success": true,
  "faceDetails": [
    {
      "BoundingBox": {
        "Width": 0.23,
        "Height": 0.34,
        "Left": 0.35,
        "Top": 0.25
      },
      "AgeRange": {
        "Low": 25,
        "High": 35
      },
      "Smile": {
        "Value": true,
        "Confidence": 95.5
      },
      "Eyeglasses": {
        "Value": false,
        "Confidence": 99.2
      },
      "Sunglasses": {
        "Value": false,
        "Confidence": 99.8
      },
      "Gender": {
        "Value": "Male",
        "Confidence": 96.8
      },
      "Beard": {
        "Value": false,
        "Confidence": 85.6
      },
      "Mustache": {
        "Value": false,
        "Confidence": 90.3
      },
      "EyesOpen": {
        "Value": true,
        "Confidence": 98.7
      },
      "MouthOpen": {
        "Value": false,
        "Confidence": 89.4
      },
      "Emotions": [
        {
          "Type": "HAPPY",
          "Confidence": 92.5
        },
        {
          "Type": "CALM",
          "Confidence": 5.2
        }
      ],
      "Landmarks": [...],
      "Pose": {
        "Roll": -2.1,
        "Yaw": 1.8,
        "Pitch": -3.5
      },
      "Quality": {
        "Brightness": 78.5,
        "Sharpness": 95.2
      },
      "Confidence": 99.8
    }
  ],
  "count": 1,
  "imageSize": 1048576,
  "processingTime": 1250
}

Environment Variables Required:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY  
- AWS_REGION (optional, defaults to us-east-1)
*/