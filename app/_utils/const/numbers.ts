export class CNumbers {
    // Timeout durations (in milliseconds)
    static readonly SHORT_TIMEOUT = 5000;
    static readonly MEDIUM_TIMEOUT = 10000;
    static readonly LONG_TIMEOUT = 30000;

    // Pagination
    static readonly ITEMS_PER_PAGE = 10;
    static readonly MAX_ITEMS_PER_PAGE = 100;

    // Retry attempts
    static readonly MAX_RETRY_ATTEMPTS = 3;

    // Status codes
    static readonly STATUS_OK = 200;
    static readonly STATUS_CREATED = 201;
    static readonly STATUS_NO_CONTENT = 204;
    static readonly STATUS_BAD_REQUEST = 400;
    static readonly STATUS_UNAUTHORIZED = 401;
    static readonly STATUS_FORBIDDEN = 403;
    static readonly STATUS_NOT_FOUND = 404;
    static readonly STATUS_INTERNAL_SERVER_ERROR = 500;

    // Other constants
    static readonly MAX_UPLOAD_SIZE_MB = 50;
    static readonly MIN_PASSWORD_LENGTH = 8;
    static readonly MAX_PASSWORD_LENGTH = 128;

    // Phone number
    static readonly PHONE_MIN_LENGTH = 10;
    static readonly PHONE_MAX_LENGTH = 13;

    static readonly MAX_FILE_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

    // Kmeans related constants
    static readonly KMEANS_THRESHOLD = 10;
    static readonly KMEANS_RETENTION_MONTHS = 12;
    static readonly KMEANS_RECOMPUTE_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
    static readonly KMEANS_RECOMPUTE_INTERVAL_MONTH = 1000 * 60 * 60 * 24 * 30; // 30 days
    static readonly KMEANS_RECOMPUTE_INTERVAL_YEAR = 1000 * 60 * 60 * 24 * 365; // 365 days
    static readonly KMEANS_RECOMPUTE_INTERVAL_QUARTER = 1000 * 60 * 60 * 24 * 90; // 90 days
    static readonly KMEANS_RECOMPUTE_INTERVAL_HALF_YEAR = 1000 * 60 * 60 * 24 * 180; // 180 days

    // Number of days after which a cluster is considered finalized
    static readonly CLUSTER_FINALIZATION_DAYS = 5;
}
