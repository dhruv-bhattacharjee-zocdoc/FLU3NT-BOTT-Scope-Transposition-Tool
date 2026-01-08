import React from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';
import DeepanshImage from './Deepansh.jpg';
import DhruvImage from './Dhruv.png';
import ZahraImage from './zahra.png';
import NikhilImage from './Nikhil.png';
import ShrutiImage from './Shruti.png';

/**
 * Meet the Team - Content Component
 */
export default function MeetTheTeam() {
  const teamMembers = [
    {
      id: 1,
      name: 'Deepansh Agarwal',
      role: 'Project Primary Owner',
      image: DeepanshImage
    },
    {
      id: 2,
      name: 'Dhruv Bhattacharjee',
      role: 'Project Secondary Owner and Developer',
      image: DhruvImage
    },
    {
      id: 3,
      name: 'Zahra Qayoom',
      role: 'Project Manager and Owner',
      image: ZahraImage
    },
    {
      id: 4,
      name: 'Nikhil Chavan',
      role: 'SME and Testing Lead',
      image: NikhilImage
    },
   
    {
      id: 5,
      name: 'M Shruti',
      role: 'Tester and Tool Enhancements',
      image: ShrutiImage
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Meet the Team
      </h3>
      
      <p className="text-neutral-600 mb-8">
        Get to know the talented team behind FLU3NT. Each member brings unique expertise and dedication to make this tool a success.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="bg-white rounded-lg shadow-md p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            {/* Profile Picture Placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full bg-neutral-100 border-2 border-neutral-300 flex items-center justify-center overflow-hidden">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-neutral-400" />
                )}
              </div>
            </div>

            {/* Name */}
            <h4 className="text-xl font-semibold text-neutral-800 text-center mb-2">
              {member.name}
            </h4>

            {/* Role */}
            <p className="text-sm text-neutral-600 text-center">
              {member.role}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

