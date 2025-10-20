import { BrainCircuit, Camera, Zap } from 'lucide-react';
import { Task } from '../../components/klipp/TaskCard';

export const mockTasks: Task[] = [
  { id: 'TASK001', title: 'Verify Storefront Hours', description: 'Visit a location and photograph the store\'s posted hours.', category: 'Field Verification', icon: Camera, earnings: 15, time: 20, timeEstimate: '20 min' },
  { id: 'TASK002', title: 'Train AI Object Recognition', description: 'Identify and label objects in images to train our AI models.', category: 'AI Training', icon: BrainCircuit, earnings: 8, time: 15, timeEstimate: '15 min' },
  { id: 'TASK003', title: 'Test New App Feature', description: 'Test a new app feature and provide feedback via a short survey.', category: 'Usability Testing', icon: Zap, earnings: 25, time: 30, timeEstimate: '30 min' },
  { id: 'TASK004', title: 'Local Landmark Photo', description: 'Submit a high-quality, original photo of a well-known local landmark.', category: 'Data Collection', icon: Camera, earnings: 12, time: 15, timeEstimate: '15 min' },
  { id: 'TASK005', title: 'Product Categorization', description: 'Sort a list of products into the correct categories for our marketplace.', category: 'AI Training', icon: BrainCircuit, earnings: 10, time: 25, timeEstimate: '25 min' },
  { id: 'TASK006', title: 'App Onboarding Feedback', description: 'Go through the new user onboarding flow and report any issues.', category: 'Usability Testing', icon: Zap, earnings: 18, time: 20, timeEstimate: '20 min' },
];
