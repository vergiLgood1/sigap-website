export class CTexts {
    // Auth texts
    static readonly LOGIN = 'Login';
    static readonly LOGOUT = 'Logout';
    static readonly LOGIN_SUCCESS = 'Login successful';
    static readonly LOGIN_FAILURE = 'Login failed, please try again';
    static readonly SIGNUP = 'Sign Up';
    static readonly SIGNUP_SUCCESS = 'Account created successfully';
    static readonly SIGNUP_FAILURE = 'Account creation failed';

    // Loading texts
    static readonly LOADING = 'Loading...';
    static readonly PLEASE_WAIT = 'Please wait...';
    static readonly LOADING_DATA = 'Loading data...';
    static readonly LOADING_CONTENT = 'Loading content...';

    // Action texts (Save, Delete, etc)
    static readonly SAVE = 'Save';
    static readonly SAVE_SUCCESS = 'Saved successfully';
    static readonly SAVE_FAILURE = 'Failed to save';
    static readonly DELETE = 'Delete';
    static readonly DELETE_CONFIRM = 'Are you sure you want to delete?';
    static readonly DELETE_SUCCESS = 'Deleted successfully';
    static readonly DELETE_FAILURE = 'Failed to delete';
    static readonly UPDATE = 'Update';
    static readonly UPDATE_SUCCESS = 'Updated successfully';
    static readonly UPDATE_FAILURE = 'Failed to update';

    // Success texts
    static readonly OPERATION_SUCCESS = 'Operation completed successfully';
    static readonly DATA_SAVED = 'Data has been saved';
    static readonly ITEM_ADDED = 'Item added successfully';
    static readonly CHANGES_SAVED = 'Changes saved successfully';
    static readonly ITEM_REMOVED = 'Item removed successfully';
    static readonly PROFILE_UPDATED = 'Profile updated successfully';

    // Failure texts
    static readonly OPERATION_FAILURE = 'Operation failed';
    static readonly DATA_NOT_SAVED = 'Data could not be saved';
    static readonly ITEM_NOT_ADDED = 'Item could not be added';
    static readonly CHANGES_NOT_SAVED = 'Changes could not be saved';
    static readonly ITEM_NOT_REMOVED = 'Item could not be removed';
    static readonly PROFILE_NOT_UPDATED = 'Profile could not be updated';

    // Error texts
    static readonly GENERIC_ERROR = 'An error occurred, please try again';
    static readonly NETWORK_ERROR = 'Network error, please check your connection';
    static readonly UNAUTHORIZED = 'You are not authorized to perform this action';
    static readonly NOT_FOUND = 'Resource not found';
    static readonly SERVER_ERROR = 'Server error, please try again later';
    static readonly FORM_ERROR = 'There was an error with your form submission';
    static readonly TIMEOUT_ERROR = 'Request timed out, please try again';
    static readonly CONNECTION_ERROR = 'Connection error, please try again later';

    // Notification texts
    static readonly NEW_MESSAGE = 'You have a new message';
    static readonly NEW_NOTIFICATION = 'You have a new notification';
    static readonly DATA_UPDATED = 'Data has been updated';
    static readonly NEW_UPDATE = 'A new update is available';
    static readonly REMINDER = 'You have a reminder';
    static readonly ALERT = 'You have an alert';

    // Form texts
    static readonly FILL_REQUIRED_FIELDS = 'Please fill all required fields';
    static readonly INVALID_EMAIL = 'Please enter a valid email address';
    static readonly INVALID_PHONE = 'Please enter a valid phone number';
    static readonly PASSWORD_TOO_WEAK = 'Password is too weak';
    static readonly CONFIRM_PASSWORD = 'Please confirm your password';
    static readonly PASSWORDS_DO_NOT_MATCH = 'Passwords do not match';
    static readonly INVALID_INPUT = 'Invalid input, please check your data';
    static readonly REQUIRED_FIELD_MISSING = 'A required field is missing';

    // User texts
    static readonly USER_PROFILE = 'User Profile';
    static readonly USER_SETTINGS = 'User Settings';
    static readonly ACCOUNT_SETTINGS = 'Account Settings';
    static readonly CHANGE_PASSWORD = 'Change Password';
    static readonly LOGOUT_CONFIRM = 'Are you sure you want to log out?';
    static readonly USERNAME = 'Username';
    static readonly EMAIL = 'Email';
    static readonly PHONE_NUMBER = 'Phone Number';

    // Sensitivie words 
    static readonly SENSITIVE_WORDS = [

    ]

    // Phone number
    static readonly PHONE_PREFIX = ['+62', '62', '0']

    static readonly ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
}
