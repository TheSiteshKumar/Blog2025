'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="p-8 md:p-12">
            <Link href="/" passHref legacyBehavior>
              <Button variant="ghost" className="mb-6" asChild>
                <a>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </a>
              </Button>
            </Link>

            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last Updated: May 28, 2025</p>

            <div className="prose prose-lg max-w-none">
              <h2>Introduction</h2>
              <p>
                Welcome to BlogHub ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>

              <h2>Information We Collect</h2>
              <p>
                We collect several different types of information for various purposes to provide and improve our service to you:
              </p>
              <ul>
                <li>
                  <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
                  <ul>
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Cookies and Usage Data</li>
                  </ul>
                </li>
                <li>
                  <strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </li>
                <li>
                  <strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                </li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>
                BlogHub uses the collected data for various purposes:
              </p>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>

              <h2>Your Data Protection Rights</h2>
              <p>
                We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
              </p>
              <ul>
                <li>
                  <strong>The right to access:</strong> You have the right to request copies of your personal data.
                </li>
                <li>
                  <strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete information you believe is incomplete.
                </li>
                <li>
                  <strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.
                </li>
                <li>
                  <strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.
                </li>
                <li>
                  <strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.
                </li>
                <li>
                  <strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
                </li>
              </ul>

              <h2>Children's Privacy</h2>
              <p>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul>
                <li>By email: privacy@bloghub.com</li>
                <li>By visiting the contact page on our website: <Link href="/contact" className="text-blue-600 hover:underline">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}