'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  skills: string[];
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    bio: 'Sarah founded BlogHub with a vision to create a platform where writers could share their knowledge and insights with the world. With over 15 years of experience in digital publishing, she leads our team with passion and innovation.',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    },
    skills: ['Leadership', 'Content Strategy', 'Digital Publishing']
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Michael oversees all technical aspects of BlogHub. His expertise in web development and system architecture has been instrumental in building our robust and scalable platform.',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    },
    skills: ['Full-Stack Development', 'System Architecture', 'Cloud Infrastructure']
  },
  {
    id: 3,
    name: 'Olivia Rodriguez',
    role: 'Head of Content',
    bio: 'Olivia brings her extensive background in journalism and content creation to lead our content strategy. She works closely with writers to ensure high-quality, engaging content across all topics.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    skills: ['Content Creation', 'Editorial Management', 'SEO']
  },
  {
    id: 4,
    name: 'David Wilson',
    role: 'Lead Developer',
    bio: 'David is responsible for the technical implementation of BlogHub\'s features. His focus on user experience and performance has helped make our platform fast, reliable, and easy to use.',
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    skills: ['Frontend Development', 'React', 'Performance Optimization']
  },
  {
    id: 5,
    name: 'Aisha Patel',
    role: 'UX/UI Designer',
    bio: 'Aisha creates the beautiful, intuitive interfaces that make BlogHub a joy to use. Her background in both design and psychology helps her create experiences that are both aesthetically pleasing and highly functional.',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    skills: ['UI Design', 'User Research', 'Prototyping']
  },
  {
    id: 6,
    name: 'James Thompson',
    role: 'Marketing Director',
    bio: 'James leads our marketing efforts, focusing on growing our user base and increasing engagement. His data-driven approach has helped BlogHub reach millions of readers worldwide.',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    skills: ['Digital Marketing', 'Analytics', 'Growth Strategy']
  }
];

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About BlogHub</h1>
            <p className="text-xl text-blue-100 mb-8">
              We're on a mission to empower writers and connect readers with valuable insights and knowledge.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                BlogHub was founded in 2020 with a simple yet powerful vision: to create a platform where knowledge could be shared freely and accessibly. What began as a small project has grown into a thriving community of writers, readers, and thinkers.
              </p>
              <p>
                We believe that everyone has valuable insights to share, and our mission is to provide the tools and platform to make that sharing as easy and impactful as possible. Whether you're an expert in your field or simply passionate about a topic, BlogHub is designed to help you connect with an audience that values your perspective.
              </p>
              <p>
                Over the years, we've evolved from a basic blogging platform to a comprehensive publishing ecosystem, with features designed to support writers at every stage of their journey. From our intuitive editor to our robust analytics, every aspect of BlogHub is crafted to help you create, share, and grow.
              </p>
              <p>
                Today, millions of readers visit BlogHub each month to discover new ideas, deepen their understanding of complex topics, and connect with writers who inspire them. We're proud of what we've built, but we're even more excited about what's to come.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at BlogHub.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-700">Knowledge Sharing</h3>
              <p className="text-gray-700">
                We believe in the power of shared knowledge to transform lives and communities. By making information accessible, we help people learn, grow, and innovate.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-700">Quality Content</h3>
              <p className="text-gray-700">
                We're committed to promoting content that is accurate, thoughtful, and valuable. Our platform is designed to highlight substance over sensationalism.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-700">Inclusive Community</h3>
              <p className="text-gray-700">
                We strive to create a space where diverse voices are welcomed and respected. We believe that the best conversations include a wide range of perspectives.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The talented people behind BlogHub who make everything possible.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member) => (
              <motion.div key={member.id} variants={fadeIn}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-blue-600 mb-2">{member.role}</p>
                      <div className="flex space-x-2 mb-4">
                        {member.social.twitter && (
                          <Link href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-5 w-5 text-gray-500 hover:text-blue-400" />
                          </Link>
                        )}
                        {member.social.linkedin && (
                          <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-5 w-5 text-gray-500 hover:text-blue-700" />
                          </Link>
                        )}
                        {member.social.github && (
                          <Link href={member.social.github} target="_blank" rel="noopener noreferrer">
                            <Github className="h-5 w-5 text-gray-500 hover:text-gray-900" />
                          </Link>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{member.bio}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-gray-600 mb-8">
              Whether you're a reader, writer, or both, we'd love to have you as part of our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" passHref legacyBehavior>
                <a className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Explore Articles
                </a>
              </Link>
              <Link href="/contact" passHref legacyBehavior>
                <a className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors">
                  Contact Us
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}