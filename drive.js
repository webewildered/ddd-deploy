const CLIENT_ID = '1061908190627-rvg57uk4euv27b8hovka4i1ph56o5onu.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBZC2CEvNyjdJYH4-31LNAYFpD2F7Plny0';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const FILENAME = 'ddd.txt';
const LOCAL_TOKEN_KEY = 'ddd_token';
export class GDriveAppData {
    constructor() {
        this.signInCallback = null;
        this.tokenData = null;
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: tokenResponse => {
                let lifetimeSec = Number(tokenResponse.expires_in) - 60;
                this.tokenData = {
                    token: tokenResponse.access_token,
                    expiration: new Date(Date.now() + lifetimeSec * 1000).toISOString()
                };
                localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(this.tokenData));
                this.onTokenResponse(tokenResponse.access_token, tokenResponse.error);
            },
            error_callback: error => this.onTokenResponse(null, error.message),
        });
    }
    onTokenResponse(accessToken, error) {
        if (this.signInCallback !== null) {
            this.signInCallback(null);
            this.signInCallback = null;
        }
    }
    wasSignedIn() {
        return this.tokenData !== null;
    }
    isSignedIn() {
        return this.tokenData !== null && new Date(this.tokenData.expiration) > new Date();
    }
    init() {
        // Load saved token
        const tokenDataStr = localStorage.getItem(LOCAL_TOKEN_KEY);
        this.tokenData = tokenDataStr ? JSON.parse(tokenDataStr) : null;
        return new Promise((resolve, reject) => {
            gapi.load('client', () => {
                gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC]
                })
                    .then(() => resolve())
                    .catch((error) => reject(error));
            });
        });
    }
    signIn(signInCallback) {
        if (this.signInCallback !== null) {
            signInCallback(new Error('Login already in progress'));
        }
        else {
            this.signInCallback = signInCallback;
            this.tokenClient.requestAccessToken({ prompt: '' });
        }
    }
    save(content) {
        // First, check if file exists
        return gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            q: `name='${FILENAME}'`
        })
            .then(listRes => {
            const files = listRes.result.files || [];
            const fileMetadata = {
                name: FILENAME,
                parents: ['appDataFolder'],
                mimeType: 'text/plain',
            };
            const media = {
                mimeType: 'text/plain',
                body: content,
            };
            if (files.length === 0) {
                // Create new
                return gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: 'id, name'
                }).then(createRes => createRes.result.id);
            }
            return files[0].id; // Return the ID of the existing file
        })
            .then(fileId => {
            // Update existing
            if (fileId === undefined) {
                throw new Error('File ID is undefined');
            }
            return gapi.client.request({
                path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                body: content,
                params: {
                    uploadType: 'media',
                    fields: 'id,version,name',
                },
            });
        });
    }
    load() {
        // Find the file
        return gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            q: `name='${FILENAME}'`
        })
            .then(listRes => {
            const files = listRes.result.files || [];
            if (files.length === 0) {
                return '';
            }
            const fileId = files[0].id;
            if (fileId === undefined) {
                return '';
            }
            // Download the file
            return gapi.client.drive.files.get({
                fileId,
                alt: 'media'
            })
                .then(resp => {
                return resp.body;
            });
        });
    }
}
//# sourceMappingURL=drive.js.map