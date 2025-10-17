// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users, X } from "lucide-react";

// Import images
import PatrickImage from ',./assets/Profile/image1.png';
import SuheilaImage from '../assets/Profile/image2.png';
import LouisImage from '../assets/Profile/image3.png';
import StephenImage from '../assets/Profile/image4.png';

function Developers() {
  const [activeMember, setActiveMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Patrick Miguel Andrade",
      role: "Lead Developer",
      icon: Code,
      image: PatrickImage,
      description: "Full-stack developer specializing in React and Node.js. Responsible for system architecture and core functionality implementation. Passionate about creating efficient and scalable solutions that enhance user experience.",
      skills: ["React", "Node.js", "MongoDB", "Express", "API Design", "TypeScript"],
      github: "https://github.com/patrickandrade",
      email: "patrick.andrade@usa.edu.ph",
      portfolio: "https://patrickandrade.dev"
    },
    {
      id: 2,
      name: "Suheila Belle Morales",
      role: "UI/UX Designer",
      icon: Palette,
      image: SuheilaImage,
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing. Specializes in creating user-centered designs that bridge aesthetics and functionality.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.design"
    },
    {
      id: 3,
      name: "Louis Miguel Parenno",
      role: "Documentation Specialist",
      icon: FileText,
      image: LouisImage,
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation. Ensures all technical processes are well-documented and easily understandable for end-users.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown", "Content Strategy"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.write"
    },
    {
      id: 4,
      name: "Stephen Madero Jr.",
      role: "Project Manager",
      icon: Users,
      image: StephenImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication. Focuses on agile methodologies to deliver high-quality products efficiently.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum", "Leadership"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1 mb-8">
            <div className="bg-white rounded-xl px-6 py-3">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                BSIT 4A - Group 4
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The passionate developers behind CircuLink - creating innovative solutions 
            for the Augustinian community through technology and collaboration.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border border-gray-100 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-4 border-white"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-16 pb-8 px-6 text-center">
                  <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-semibold text-sm mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {member.description}
                  </p>
                  
                  <div className="mt-6 flex justify-center space-x-3">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Mission Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-12 border border-gray-100">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission at CircuLink
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              As fourth-year BS Information Technology students from the University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. 
              CircuLink represents our dedication to enhancing the library experience for the 
              Augustinian community with a modern, efficient room reservation system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-sm text-gray-600">Cutting-edge solutions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-sm text-gray-600">Teamwork driven</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-sm text-gray-600">Quality focused</p>
              </div>
            </div>
          </div>
        </div>

        {/* Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Blur Overlay */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Profile */}
                <div className="lg:w-2/5 bg-gradient-to-b from-blue-500 to-purple-600 p-8 text-white">
                  <div className="text-center lg:text-left">
                    <div className="w-32 h-32 mx-auto lg:mx-0 mb-6 rounded-full bg-white p-2 shadow-2xl">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover border-4 border-white"
                      />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">{activeMember.name}</h2>
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                      <activeMember.icon className="w-5 h-5" />
                      <span className="font-semibold text-blue-100">{activeMember.role}</span>
                    </div>
                    
                    <p className="text-blue-100 leading-relaxed mb-8">
                      {activeMember.description}
                    </p>
                    
                    <div className="flex justify-center lg:justify-start space-x-4">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Details */}
                <div className="lg:w-3/5 p-8 overflow-y-auto max-h-[70vh]">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {activeMember.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 text-center border border-gray-100 hover:border-blue-200 transition-all duration-300"
                      >
                        <span className="font-semibold text-gray-900">{skill}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Get in Touch</h4>
                    <div className="space-y-4">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-300 w-full"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-medium">View GitHub Profile</span>
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 w-full"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">Send Email</span>
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 w-full"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-medium">Visit Portfolio</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Developers;