// utils/aws-utils.ts
// Shared utilities for AWS Rekognition functions

export interface AWSCredentials {
  region: string;
  accessKey: string;
  secretKey: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate AWS credentials from environment variables
 */
export function validateAWSCredentials(): { credentials?: AWSCredentials; error?: string } {
  const region = Deno.env.get('AWS_REGION');
  const accessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

  const requiredEnvVars = [
    { name: 'AWS_REGION', value: region },
    { name: 'AWS_ACCESS_KEY_ID', value: accessKey },
    { name: 'AWS_SECRET_ACCESS_KEY', value: secretKey }
  ];

  const missingVars = requiredEnvVars
    .filter(envVar => !envVar.value)
    .map(envVar => envVar.name);

  if (missingVars.length > 0) {
    return {
      error: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }

  return {
    credentials: {
      region: region!,
      accessKey: accessKey!,
      secretKey: secretKey!
    }
  };
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File | null, fieldName: string): ValidationResult {
  if (!file || !(file instanceof File)) {
    return {
      isValid: false,
      error: `${fieldName} file is required`
    };
  }

  // Check file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `${fieldName} file size too large. Maximum 5MB allowed`
    };
  }

  // Check file type
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid ${fieldName} file type. Only JPEG and PNG allowed`
    };
  }

  return { isValid: true };
}

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Create AWS Signature V4 for Rekognition requests
 */
export async function createAWSSignature(
  request: any,
  service: string,
  target: string,
  credentials: AWSCredentials
): Promise<{ authHeader: string; amzDate: string }> {
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const host = `${service}.${credentials.region}.amazonaws.com`;

  // Request details
  const method = 'POST';
  const contentType = 'application/x-amz-json-1.1';
  const canonicalUri = '/';
  const canonicalQueryString = '';

  // Create payload hash
  const payloadHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(request))
  ).then(hash =>
    Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );

  // Create canonical headers
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';

  // Create canonical request
  const canonicalRequest =
    `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${credentials.region}/${service}/aws4_request`;

  const canonicalRequestHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalRequest)
  ).then(hash =>
    Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );

  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  // Create signing key
  const signingKey = await getSignatureKey(
    credentials.secretKey,
    dateStamp,
    credentials.region,
    service
  );

  // Create signature
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(stringToSign)
  ).then(hash =>
    Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );

  // Create authorization header
  const authHeader =
    `${algorithm} ` +
    `Credential=${credentials.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  return { authHeader, amzDate };
}

/**
 * Helper function to create AWS signing key
 */
async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`AWS4${key}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const kRegion = await crypto.subtle.sign(
    "HMAC",
    kDate,
    new TextEncoder().encode(regionName)
  );

  const kService = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", kRegion, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(serviceName)
  );

  return crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", kService, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode("aws4_request")
  );
}

/**
 * Make request to AWS Rekognition
 */
export async function makeRekognitionRequest(
  request: any,
  target: string,
  credentials: AWSCredentials
): Promise<any> {
  const { authHeader, amzDate } = await createAWSSignature(request, 'rekognition', target, credentials);
  const endpoint = `https://rekognition.${credentials.region}.amazonaws.com/`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Date': amzDate,
      'X-Amz-Target': target,
      'Authorization': authHeader
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AWS Rekognition request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Create error response
 */
export function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}