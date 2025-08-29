"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TermsOfServiceDialogProps {
  children: React.ReactNode;
}

const TermsOfServiceDialog = ({ children }: TermsOfServiceDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Terms of Service
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <p className="text-xs text-gray-500 mb-4">Last updated: August 29, 2025</p>
            <p>
              Welcome to DevColl! These Terms of Service ("Terms") govern your use of our Q&A platform 
              and services. By using DevColl, you agree to these terms.
            </p>
          </div>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">1. Acceptable Use</h3>
            <div className="space-y-2">
              <p><strong>You may:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ask programming-related questions</li>
                <li>Provide helpful, accurate answers</li>
                <li>Share code examples and solutions</li>
                <li>Vote and comment on content</li>
                <li>Edit your own posts for clarity</li>
              </ul>
              
              <p><strong>You may not:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post spam, promotional content, or advertisements</li>
                <li>Share malicious code or security vulnerabilities</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Post copyrighted content without permission</li>
                <li>Create multiple accounts to manipulate voting</li>
                <li>Post off-topic, non-programming content</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">2. Content and Intellectual Property</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You retain ownership of content you post</li>
              <li>By posting, you grant DevColl a license to display and distribute your content</li>
              <li>You're responsible for ensuring you have rights to any code or content you share</li>
              <li>Code examples should be your own or properly attributed</li>
              <li>We may remove content that violates these terms</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">3. Community Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Be respectful:</strong> Treat all users with courtesy and professionalism</li>
              <li><strong>Stay on topic:</strong> Keep discussions relevant to programming and development</li>
              <li><strong>Provide quality content:</strong> Write clear, helpful questions and answers</li>
              <li><strong>No plagiarism:</strong> Don't copy content from other sites without attribution</li>
              <li><strong>Help others learn:</strong> Explain solutions, don't just provide code</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">4. Account Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You're responsible for maintaining account security</li>
              <li>One account per person</li>
              <li>Accurate profile information required</li>
              <li>Report security issues immediately</li>
              <li>We may suspend accounts for violations</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">5. Moderation and Enforcement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>We reserve the right to moderate all content</li>
              <li>Violations may result in warnings, suspensions, or bans</li>
              <li>Repeated violations may result in permanent account closure</li>
              <li>Appeals process available for moderation decisions</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">6. Disclaimers</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>DevColl is provided "as is" without warranties</li>
              <li>Code and advice shared by users is not professionally verified</li>
              <li>Always test code in safe environments before production use</li>
              <li>We're not liable for damages from user-generated content</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">7. Privacy and Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>See our Privacy Policy for data handling practices</li>
              <li>We don't sell personal information to third parties</li>
              <li>You can request data deletion at any time</li>
              <li>Cookies used for essential functionality and analytics</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">8. Changes to Terms</h3>
            <p>
              We may update these terms periodically. Significant changes will be communicated 
              to users via email or platform notifications. Continued use after changes 
              constitutes acceptance of new terms.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">9. Contact Us</h3>
            <p>
              Questions about these terms? Contact us at:{" "}
              <a href="mailto:legal@devcoll.com" className="text-blue-600 hover:text-blue-800">
                legal@devcoll.com
              </a>
            </p>
          </section>

          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-gray-500">
              By using DevColl, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceDialog;
