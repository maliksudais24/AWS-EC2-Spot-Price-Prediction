# scheduler.py

import schedule
import time
import model   # imports model.py

# List of regions
regions = ["us-east-1", "us-west-2", "eu-west-1"]

def retrain_models():
    print("Starting scheduled retraining...")
    
    for region in regions:
        model.train_region(region)

    print("Retraining complete!")


# run once immediately (optional but recommended)
retrain_models()

# Schedule every 1 hour
schedule.every(1).hours.do(retrain_models)

print("Scheduler started. Models will retrain every 1 hour.")

while True:
    schedule.run_pending()
    time.sleep(60)