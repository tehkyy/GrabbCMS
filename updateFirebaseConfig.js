import jsonfile from 'jsonfile';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Convert __dirname to be compatible with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.join(__dirname, 'firebase.json');

const siteConfig = {
    development: "grabbit-dev-b598a",
    production: "grabbit-370315"
};

const updateFirebaseConfig = async (environment) => {
    try {
        const config = await jsonfile.readFile(firebaseConfigPath);

        const site = siteConfig[environment];
        if (!site) {
            throw new Error(`No site configuration found for environment: ${environment}`);
        }

        config.hosting.site = site;

        await jsonfile.writeFile(firebaseConfigPath, config, { spaces: 2 });

        console.log(`Firebase Hosting site set to: ${site}`);
    } catch (error) {
        console.error(`Failed to update Firebase config: ${error.message}`);
    }
};

// Get environment from command line arguments or default to 'development'
const env = process.argv[2] || 'development';

updateFirebaseConfig(env);
