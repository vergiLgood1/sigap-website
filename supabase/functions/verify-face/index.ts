// verify-face/index.ts
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { RekognitionClient, CompareFacesCommand } from "npm:@aws-sdk/client-rekognition@^3.0.0";
import {
  validateAWSCredentials,
  validateFile,
  createErrorResponse,
  createSuccessResponse
} from "../shared/aws-utils.ts";

interface VerifyFaceResponse {
  success: true;
  matched: boolean;
  similarity: number;
  similarityThreshold: number;
  faceMatches: any[];
  unmatchedFaces: any[];
  idCardImageSize?: number;
  selfieImageSize?: number;
  processingTime?: number;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Configuration constants
const DEFAULT_SIMILARITY_THRESHOLD = 70;
const HIGH_CONFIDENCE_THRESHOLD = 85;
const MEDIUM_CONFIDENCE_THRESHOLD = 75;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Logger utility for structured logs
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] [verify-face] ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] [verify-face] ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] [verify-face] ${message}`, error ? error : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG] [${new Date().toISOString()}] [verify-face] ${message}`, data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(`[SUCCESS] [${new Date().toISOString()}] [verify-face] ${message}`, data ? data : '');
  }
};

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logger.info(`Starting face verification request [ID: ${requestId}]`);

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

    // Get and validate both images
    const idCardImage = formData.get('idCard') as File | null;
    const selfieImage = formData.get('selfie') as File | null;

    // Validate IDCARD image
    logger.debug(`Validating IDCARD image [ID: ${requestId}]`);
    const idCardValidation = validateFile(idCardImage, 'IDCARD');
    if (!idCardValidation.isValid) {
      logger.warn(`IDCARD image validation failed [ID: ${requestId}]`, idCardValidation.error);
      return createErrorResponse(idCardValidation.error || 'Invalid IDCARD image', 400);
    }

    // Validate selfie image
    logger.debug(`Validating selfie image [ID: ${requestId}]`);
    const selfieValidation = validateFile(selfieImage, 'selfie');
    if (!selfieValidation.isValid) {
      logger.warn(`Selfie image validation failed [ID: ${requestId}]`, selfieValidation.error);
      return createErrorResponse(selfieValidation.error || 'Invalid selfie image', 400);
    }

    // Log image details
    logger.info(`Processing images [ID: ${requestId}]`, {
      idCard: {
        name: idCardImage!.name,
        size: `${(idCardImage!.size / 1024).toFixed(2)} KB`,
        type: idCardImage!.type
      },
      selfie: {
        name: selfieImage!.name,
        size: `${(selfieImage!.size / 1024).toFixed(2)} KB`,
        type: selfieImage!.type
      }
    });

    // Get similarity threshold from form data or use default
    const thresholdParam = formData.get('similarity_threshold');
    let similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD;

    if (thresholdParam) {
      const parsedThreshold = parseFloat(thresholdParam.toString());
      if (!isNaN(parsedThreshold) && parsedThreshold >= 0 && parsedThreshold <= 100) {
        similarityThreshold = parsedThreshold;
        logger.debug(`Using custom similarity threshold: ${similarityThreshold}% [ID: ${requestId}]`);
      } else {
        logger.warn(`Invalid similarity threshold provided, using default: ${DEFAULT_SIMILARITY_THRESHOLD}% [ID: ${requestId}]`);
      }
    }

    // Convert images to Uint8Array
    logger.debug(`Converting images to binary format [ID: ${requestId}]`);
    let idCardBytes: Uint8Array, selfieBytes: Uint8Array;
    try {
      [idCardBytes, selfieBytes] = await Promise.all([
        fileToUint8Array(idCardImage!),
        fileToUint8Array(selfieImage!)
      ]);
    } catch (error) {
      logger.error(`Failed to convert images to bytes [ID: ${requestId}]`, error);
      return createErrorResponse('Failed to process image data', 500);
    }

    // Create CompareFaces command
    logger.info(`Sending request to AWS Rekognition CompareFaces with threshold: ${similarityThreshold}% [ID: ${requestId}]`);
    const compareFacesCommand = new CompareFacesCommand({
      SourceImage: {
        Bytes: idCardBytes
      },
      TargetImage: {
        Bytes: selfieBytes
      },
      SimilarityThreshold: similarityThreshold
    });

    // Execute AWS Rekognition request
    let rekognitionResponse: any;
    try {
      rekognitionResponse = await rekognitionClient.send(compareFacesCommand);
    } catch (error) {
      logger.error(`AWS Rekognition request failed [ID: ${requestId}]`, error);

      // Handle specific AWS errors
      if (error.name === 'InvalidImageFormatException') {
        return createErrorResponse('Invalid image format. Please use JPEG or PNG format', 400);
      } else if (error.name === 'ImageTooLargeException') {
        return createErrorResponse('Image too large. Please reduce image size', 400);
      } else if (error.name === 'InvalidParameterException') {
        return createErrorResponse('Invalid parameters provided', 400);
      }

      return createErrorResponse('Failed to compare faces with AWS Rekognition', 500);
    }

    // Process results
    const processingTime = Date.now() - startTime;
    const matched = !!(rekognitionResponse.FaceMatches && rekognitionResponse.FaceMatches.length > 0);

    let highestSimilarity = 0;
    if (matched && rekognitionResponse.FaceMatches && rekognitionResponse.FaceMatches.length > 0) {
      highestSimilarity = Math.max(...rekognitionResponse.FaceMatches.map((match: any) => match.Similarity || 0));
    }

    // Determine confidence level
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    if (highestSimilarity >= HIGH_CONFIDENCE_THRESHOLD) {
      confidence = 'HIGH';
    } else if (highestSimilarity >= MEDIUM_CONFIDENCE_THRESHOLD) {
      confidence = 'MEDIUM';
    } else {
      confidence = 'LOW';
    }

    // Log results in a structured format
    logger.success(`Face verification completed [ID: ${requestId}]`, {
      matched: matched,
      similarity: `${highestSimilarity.toFixed(2)}%`,
      confidence: confidence,
      processingTime: `${processingTime}ms`,
      faceMatchesCount: rekognitionResponse.FaceMatches?.length || 0,
      unmatchedFacesCount: rekognitionResponse.UnmatchedFaces?.length || 0
    });

    // Prepare response
    const response: VerifyFaceResponse = {
      success: true,
      matched: matched,
      similarity: parseFloat(highestSimilarity.toFixed(2)),
      similarityThreshold: similarityThreshold,
      faceMatches: rekognitionResponse.FaceMatches || [],
      unmatchedFaces: rekognitionResponse.UnmatchedFaces || [],
      idCardImageSize: idCardImage!.size,
      selfieImageSize: selfieImage!.size,
      processingTime,
      confidence
    };

    return createSuccessResponse(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(`Unexpected error in verify-face function [ID: ${requestId}]`, error);
    logger.error(`Processing time before error: ${processingTime}ms [ID: ${requestId}]`);

    return createErrorResponse(
      "An unexpected error occurred while verifying faces",
      500
    );
  }
});

/* 
To invoke locally:

1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
2. Make an HTTP request:

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-face' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
  --form 'idCard=@"path/to/idCard.jpg"' \
  --form 'selfie=@"path/to/selfie.jpg"' \
  --form 'similarity_threshold=75'

Example response:
{
  "success": true,
  "matched": true,
  "similarity": 87.45,
  "similarityThreshold": 75,
  "faceMatches": [...],
  "unmatchedFaces": [],
  "idCardImageSize": 1048576,
  "selfieImageSize": 2097152,
  "processingTime": 1450,
  "confidence": "HIGH"
}

Environment Variables Required:
- AWS_RK_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY  
- AWS_RK_REGION (optional, defaults to us-east-1)
*/