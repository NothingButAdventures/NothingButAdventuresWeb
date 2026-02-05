const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Country = require('../models/Country');
const Continent = require('../models/Continent');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DB = process.env.MONGODB_URI;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection successful!'));

const migrateContinents = async () => {
    try {
        console.log('Starting migration...');

        // 1. Fetch all countries that have a string value for continent
        // We use $type: 'string' to find documents where continent is still a string
        const oldCountries = await Country.find({ continent: { $type: 'string' } }).lean();

        console.log(`Found ${oldCountries.length} countries with legacy continent strings.`);

        if (oldCountries.length === 0) {
            console.log('No migration needed.');
            process.exit();
        }

        // 2. Map of continent name strings to their ObjectIds
        const continentMap = {};
        const continents = await Continent.find();

        continents.forEach(cont => {
            // Store both exact match and lowercase for robustness
            continentMap[cont.name] = cont._id;
            continentMap[cont.name.toLowerCase()] = cont._id;
        });

        console.log('Available Continents:', Object.keys(continentMap));

        // 3. Update each country
        let successCount = 0;
        let errorCount = 0;

        for (const country of oldCountries) {
            // The existing value in database is a string, e.g. "Asia"
            const continentName = country.continent;

            if (!continentName) {
                console.warn(`Country ${country.name} has no continent value. Skipping.`);
                continue;
            }

            // Find corresponding ID
            const continentId = continentMap[continentName] || continentMap[continentName.toLowerCase()];

            if (continentId) {
                // Update the country with the new ID
                // We use updateOne to bypass schema type validation which might fail if we tried to save() 
                // while the field is temporarily invalid in Mongoose's eyes (string vs ObjectId)
                await Country.updateOne(
                    { _id: country._id },
                    { $set: { continent: continentId } }
                );
                console.log(`Updated ${country.name}: ${continentName} -> ${continentId}`);
                successCount++;
            } else {
                console.error(`Could not find continent ID for country: ${country.name} (Continent Value: "${continentName}")`);
                console.error('Available keys:', Object.keys(continentMap));
                errorCount++;
            }
        }

        console.log('Migration complete.');
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
};

migrateContinents();
