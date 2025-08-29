"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PrivacyPolicyDialogProps {
  children: React.ReactNode;
}

const PrivacyPolicyDialog = ({ children }: PrivacyPolicyDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Privacy Policy
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <p className="text-xs text-gray-500 mb-4">Last updated: August 29, 2025</p>
            <p>
              At DevColl, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your information when you use our Q&A platform.
            </p>
          </div>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Account Information:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address (for account creation and notifications)</li>
                <li>Username and display name</li>
                <li>Profile picture (optional)</li>
                <li>GitHub/OAuth provider information (if used for login)</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Content and Activity:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Questions, answers, and comments you post</li>
                <li>Code examples and snippets you share</li>
                <li>Voting and interaction history</li>
                <li>Search queries and browsing patterns</li>
                <li>Draft content saved locally in your browser</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Technical Information:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information and screen resolution</li>
                <li>Referrer URLs and page views</li>
                <li>Session duration and interaction timestamps</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Platform Operation:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authenticate and manage your account</li>
                <li>Display your content to other users</li>
                <li>Enable voting, commenting, and community features</li>
                <li>Provide search and discovery functionality</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Communication:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Send email notifications for responses to your content</li>
                <li>Notify you of important platform updates</li>
                <li>Respond to your support requests</li>
                <li>Send security alerts for your account</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Platform Improvement:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Analyze usage patterns to improve features</li>
                <li>Detect and prevent spam or abusive behavior</li>
                <li>Optimize search results and recommendations</li>
                <li>Conduct research on developer community needs</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Public Content:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your questions, answers, and comments are publicly visible</li>
                <li>Your username and profile information appear with your content</li>
                <li>Vote counts and reputation scores are displayed publicly</li>
                <li>Search engines may index your public content</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">We DO NOT share:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your email address with other users or third parties</li>
                <li>Private messages or draft content</li>
                <li>Personal information for marketing purposes</li>
                <li>Individual user data with advertisers</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Limited Sharing:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Anonymized analytics with trusted partners</li>
                <li>Legal compliance when required by law</li>
                <li>Security purposes to prevent fraud or abuse</li>
                <li>Business transfers (with user notification)</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">4. Data Storage and Security</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Encryption:</strong> All data transmitted over HTTPS</li>
              <li><strong>Storage:</strong> Data stored on secure cloud infrastructure</li>
              <li><strong>Access:</strong> Limited employee access on need-to-know basis</li>
              <li><strong>Backups:</strong> Regular backups with same security standards</li>
              <li><strong>Retention:</strong> Account data kept while account is active</li>
              <li><strong>Deletion:</strong> Content may remain public after account deletion</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">5. Cookies and Tracking</h3>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Essential Cookies:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>User preferences and settings</li>
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Analytics:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Page views and user interactions</li>
                <li>Feature usage and performance metrics</li>
                <li>Anonymized demographic information</li>
              </ul>
            </div>

            <p className="text-xs text-gray-600">
              You can disable non-essential cookies in your browser settings, though this may affect platform functionality.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">6. Your Rights and Choices</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access:</strong> View and download your personal data</li>
              <li><strong>Correction:</strong> Update incorrect information in your profile</li>
              <li><strong>Deletion:</strong> Request account deletion (public content may remain)</li>
              <li><strong>Portability:</strong> Export your content and data</li>
              <li><strong>Notifications:</strong> Control email preferences in settings</li>
              <li><strong>Objection:</strong> Opt out of non-essential data processing</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">7. Children's Privacy</h3>
            <p>
              DevColl is not intended for users under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe a child 
              has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">8. International Users</h3>
            <p>
              DevColl operates globally. By using our service, you consent to the transfer 
              and processing of your information in countries where we operate, which may 
              have different privacy laws than your country of residence.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">9. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be 
              communicated via email or platform notifications. The "Last updated" date 
              at the top indicates when changes were made.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">10. Contact Us</h3>
            <div className="space-y-1">
              <p>For privacy-related questions or requests, contact us at:</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@devcoll.com" className="text-blue-600 hover:text-blue-800">
                  privacy@devcoll.com
                </a>
              </p>
              <p><strong>Data Protection Officer:</strong> dpo@devcoll.com</p>
              <p><strong>Response Time:</strong> We aim to respond within 30 days</p>
            </div>
          </section>

          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-gray-500">
              By using DevColl, you acknowledge that you have read and understood this Privacy Policy 
              and consent to the collection and use of your information as described.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
