Application purpose:
The application helps users generate and manage Snowflake key-pair authentication keys. It must create the private/public key pair, provide the values to the user, generate the Snowflake SQL script required to configure the Snowflake user, and provide clear instructions for installing and using the keys.
The application must support this stack:
- Frontend: React 19
- Backend: FastAPI
- Database: PostgreSQL
Functional requirements:
1. User authentication
The application must allow users to:
- Register an account.
- Log in.
- Log out.
- View their own profile.
- Access only their own generated keys.
- Prevent unauthenticated users from accessing key-management pages.
2. Key generation
The application must allow an authenticated user to generate a Snowflake-compatible key pair.
Before generating the keys, the application must ask for these inputs:
- Key alias or key name.
- Snowflake account identifier.
- Snowflake username.
- Snowflake role, optional.
- Environment: DEV, TEST, QA, PROD, SANDBOX, or OTHER.
- Key slot: RSA_PUBLIC_KEY or RSA_PUBLIC_KEY_2.
- Key size: 2048 or 4096.
- Whether the private key should be encrypted with a passphrase.
- Passphrase, required only when encrypted private key is selected.
- Confirm passphrase.
- Expiration date, optional.
- Description or notes, optional.
The application must validate that:
- Key alias is required.
- Snowflake username is required.
- Snowflake account identifier is required.
- Environment is required.
- Key slot is required.
- Key size is either 2048 or 4096.
- Passphrase is required if encrypted private key is selected.
- Passphrase and confirm passphrase match.
- Weak passphrases are rejected.
- Key alias is unique for the authenticated user.
3. Generated outputs
After generating a key pair, the application must provide:
- Private key in PEM format.
- Public key in PEM format.
- Snowflake public key value with PEM headers, PEM footers, spaces, and line breaks removed.
- Snowflake SQL script to assign the public key to the selected Snowflake user.
- Instructions for how to install and use the private key.
- Example Snowflake authentication usage.
The Snowflake SQL script must support both key slots.
For RSA_PUBLIC_KEY:
ALTER USER <SNOWFLAKE_USERNAME>
SET RSA_PUBLIC_KEY = '<PUBLIC_KEY_VALUE>';
For RSA_PUBLIC_KEY_2:
ALTER USER <SNOWFLAKE_USERNAME>
SET RSA_PUBLIC_KEY_2 = '<PUBLIC_KEY_VALUE>';
4. Key management
The application must allow users to manage previously generated keys.
Users must be able to:
- View a list of their keys.
- Search keys.
- Filter keys by environment.
- Filter keys by status.
- Filter keys by Snowflake username.
- Filter keys by key slot.
- Sort keys by creation date.
- Open a key details page.
- Edit key metadata.
- View the public key.
- View the private key after confirmation.
- Copy the public key.
- Copy the private key after confirmation.
- Copy the Snowflake SQL script.
- Copy the installation instructions.
- Download the private key as a `.p8` file.
- Download the public key as a `.pub` file.
- Download the Snowflake SQL script as a `.sql` file.
- Download the installation instructions as a `.txt` file.
- Mark a key as revoked.
- Delete a key.
- Rotate a key.
Each key record must include:
- Key alias.
- Snowflake account identifier.
- Snowflake username.
- Snowflake role, if provided.
- Environment.
- Key slot.
- Key size.
- Whether the private key is encrypted.
- Status.
- Expiration date, if provided.
- Created date.
- Updated date.
- Last viewed date.
- Last downloaded date.
- Description or notes.
Supported key statuses:
- ACTIVE
- ROTATING
- EXPIRED
- REVOKED
5. Sensitive key handling
The application must treat private keys as sensitive data.
The application must:
- Mask private keys by default.
- Require explicit confirmation before revealing a private key.
- Require explicit confirmation before copying a private key.
- Require explicit confirmation before downloading a private key.
- Show a security warning before any sensitive action.
- Automatically hide revealed private keys after a short period.
- Never show private keys in the key list.
- Never expose another user’s keys.
- Store sensitive key values encrypted in the database.
The application should warn users:
- The private key is sensitive.
- Anyone with the private key may authenticate as the Snowflake user if the matching public key is configured in Snowflake.
- Private keys should not be committed to Git.
- Private keys should not be sent by email or chat.
- Production keys should be stored in a secure secret manager.
- Keys should be rotated periodically.
6. Installation instructions
For each generated key, the application must generate clear instructions that include:
Step 1:
Download and securely store the private key file.
Recommended filename format:
snowflake_<environment>_<username>_<key_alias>.p8
Step 2:
Set secure file permissions.
For macOS/Linux:
chmod 600 snowflake_<environment>_<username>_<key_alias>.p8
For Windows PowerShell, provide equivalent instructions using Windows file permissions.
Step 3:
Run the generated Snowflake SQL script using a Snowflake role that has permission to alter the target user.
Step 4:
Test Snowflake authentication using the private key.
Step 5:
Store the private key in a secure secret manager for production usage.
The instructions should mention secure storage examples such as:
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- GitHub Actions Secrets
- Anypoint Secrets Manager
7. Snowflake authentication examples
The application must generate usage examples for:
- Python Snowflake connector.
- SnowSQL.
- Generic environment variable usage.
The Python example must include placeholders for:
- Snowflake account.
- Username.
- Private key file path.
- Private key passphrase, if encrypted.
- Warehouse.
- Database.
- Schema.
- Role.
8. Key rotation
The application must provide a guided key rotation workflow.
The rotation workflow must:
- Generate a new key pair.
- Suggest using the alternate Snowflake key slot.
- Generate the ALTER USER script for the new public key.
- Instruct the user to test the new private key.
- Allow the user to mark the old key as revoked.
- Generate cleanup SQL to unset the old public key.
If the old key uses RSA_PUBLIC_KEY, the new key should use RSA_PUBLIC_KEY_2.
If the old key uses RSA_PUBLIC_KEY_2, the new key should use RSA_PUBLIC_KEY.
The cleanup SQL must support:
ALTER USER <SNOWFLAKE_USERNAME>
UNSET RSA_PUBLIC_KEY;
and:
ALTER USER <SNOWFLAKE_USERNAME>
UNSET RSA_PUBLIC_KEY_2;
9. Audit history
The application must keep an audit history for key-related actions.
The audit history must track:
- Key created.
- Private key viewed.
- Private key copied.
- Private key downloaded.
- Public key copied.
- Public key downloaded.
- SQL script copied.
- SQL script downloaded.
- Instructions copied.
- Instructions downloaded.
- Key metadata updated.
- Key rotated.
- Key revoked.
- Key deleted.
The user must be able to view the audit history for each key.
10. Dashboard
The application must provide a dashboard with:
- Total keys.
- Active keys.
- Rotating keys.
- Expired keys.
- Revoked keys.
- Keys expiring soon.
- Recent key activity.
- Recently created keys.
11. Main pages
The application must include these pages:
- Login.
- Register.
- Dashboard.
- Generate Key.
- Key List.
- Key Details.
- Edit Key Metadata.
- Rotate Key.
- Settings.
12. Key details page
The key details page must include sections or tabs for:
- Overview.
- Private Key.
- Public Key.
- Snowflake SQL Script.
- Installation Instructions.
- Authentication Examples.
- Audit History.
13. Download and copy behavior
The application must provide copy buttons and download buttons for:
- Private key.
- Public key.
- Snowflake public key value.
- Snowflake SQL script.
- Installation instructions.
- Authentication examples.
Downloaded files should use clear filenames based on:
- Environment.
- Snowflake username.
- Key alias.
- File type.
14. User experience requirements
The application should be simple, professional, and enterprise-friendly.
The user interface should:
- Clearly separate sensitive and non-sensitive values.
- Provide warnings for private key actions.
- Provide success and error messages.
- Provide loading states.
- Provide empty states when no keys exist.
- Provide confirmation dialogs for sensitive or destructive actions.
- Make it easy for a Snowflake administrator, data engineer, MuleSoft developer, or DevOps engineer to use the application without needing to understand cryptography details.
15. Settings
The application must provide a settings page where users can manage:
- Profile information.
- Default Snowflake account identifier.
- Default environment.
- Default key size.
- Default key slot preference.
- Default private key encryption preference.
16. Expected outcome
The final application should let a user complete this full workflow:
- Register or log in.
- Enter Snowflake key details.
- Generate a Snowflake-compatible key pair.
- Download the private key.
- Copy or download the Snowflake SQL script.
- Run the SQL script in Snowflake.
- Follow the installation instructions.
- Test authentication.
- Return later to view, copy, download, rotate, revoke, or delete the key.