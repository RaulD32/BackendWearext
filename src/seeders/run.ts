import { dataSeeder } from './seed.js';

async function runSeeder() {
    try {
        await dataSeeder.seedAll();
        process.exit(0);
    } catch (error) {
        console.error('Error ejecutando seeder:', error);
        process.exit(1);
    }
}

runSeeder();
