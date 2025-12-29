
import { autoGenerateSpeakingSlots } from '../src/services/notifications/autoGenerateSpeakingSlots.service';

async function main() {
    console.log('🚀 Manually triggering speaking slot generation...');
    try {
        await autoGenerateSpeakingSlots();
        console.log('✅ Manual trigger complete');
    } catch (err) {
        console.error('❌ Failed manual trigger:', err);
    }
}

main();
