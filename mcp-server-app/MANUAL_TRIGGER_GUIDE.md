# Running Workflows Without a Trigger

This guide explains how to run the imported workflows without a trigger, either by using the "Test Workflow" button or by adding a Manual trigger.

## Option 1: Use the "Test Workflow" Button (Recommended)

The simplest way to run a workflow without a trigger is to use the "Test Workflow" button:

1. Open any of the imported workflows in n8n
2. Click the "Test Workflow" button in the top-right corner
3. The workflow will execute immediately, starting from the first node

This method is perfect for testing and doesn't require any modifications to the workflow.

## Option 2: Add a Manual Trigger

If you want to keep the workflow in a state where it can be manually triggered at any time:

1. Open the workflow you want to modify
2. Click the "+" button to add a new node
3. Search for "Manual" in the nodes panel
4. Select the "Manual" trigger node
5. Position it to the left of the first node (e.g., "Get New Members")
6. Connect the Manual trigger to the first node:
   - Click and drag from the "Manual Trigger" output dot
   - Drop onto the input dot of the first node
7. Save the workflow

### Adding Manual Triggers to Each Workflow

Follow these steps for each of the imported workflows:

#### BLKOUT NXT Onboarding (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get New Members" node
4. Save the workflow

#### BLKOUT NXT Survey Follow-up (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get Members for Survey" node
4. Save the workflow

#### BLKOUT NXT Ally Drip Campaign (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get Allies" node
4. Save the workflow

#### BLKOUT NXT Black Queer Men Drip Campaign (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get BQM Members" node
4. Save the workflow

#### BLKOUT NXT QTIPOC Organiser Drip Campaign (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get Organisers" node
4. Save the workflow

#### BLKOUT NXT Organisation Drip Campaign (Code Node)
1. Open the workflow
2. Add a Manual trigger
3. Connect it to the "Get Organisations" node
4. Save the workflow

## Running the Workflows

After adding Manual triggers (or without them), you can run the workflows in two ways:

### Using the "Test Workflow" Button
1. Open the workflow
2. Click the "Test Workflow" button in the top-right corner
3. The workflow will execute immediately

### Using the Manual Trigger (if added)
1. Open the workflow
2. Click the "Execute Workflow" button in the top-right corner
3. The workflow will execute starting from the Manual trigger

## Testing the Complete System

1. Run the "BLKOUT NXT Onboarding (Code Node)" workflow to process new members
2. Update the LastEmailSent date to 7+ hours ago for test members
3. Run the "BLKOUT NXT Survey Follow-up (Code Node)" workflow to send survey emails
4. Update the OnboardingStatus to "Survey Completed" for test members
5. Run each drip campaign workflow to verify they enroll members correctly

## Notes

- The "Test Workflow" button is the simplest way to run workflows without a trigger
- Manual triggers are useful if you want to keep the workflow in a state where it can be manually triggered at any time
- You can also use the "Execute Workflow" API endpoint to trigger workflows programmatically
