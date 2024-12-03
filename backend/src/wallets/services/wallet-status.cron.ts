import cron from 'node-cron';
import { updateWalletStatuses } from './wallet.service';

export const initializeWalletStatusCron = () => {
    cron.schedule('0 0 * * *', async () => {
      console.log("Running daily wallet status update...");
      try {

        await updateWalletStatuses();
        
      } catch (error) {
        console.error("Wallet status update failed:", error);
    };
})}