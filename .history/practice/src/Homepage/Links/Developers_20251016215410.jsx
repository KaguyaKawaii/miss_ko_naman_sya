// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users, X, Star, Award, Zap } from "lucide-react";

// Import images - Fixed the import syntax
import PatrickImage from "../../assets/Profile/image1.png";
import SuheilaImage from "../../assets/Profile/image2.png";
import LouisImage from "../../assets/Profile/image3.png";
import StephenImage from "../../assets/Profile/image4.png";

function Developers() {
  const [activeMember, setActiveMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Stephen Madero Jr.",
      role: "Lead Developer",
      icon: Code,
      image: StephenImage,
      description: "Full-stack developer specializing in React and Node.js. Responsible for system architecture and core functionality implementation. Passionate about creating efficient and scalable solutions that enhance user experience.",
      skills: ["React", "Node.js", "MongoDB", "Express", "API Design", "TypeScript", "System Architecture", "Database Design"],
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
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Design Systems", "User Testing"],
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
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown", "Content Strategy", "Knowledge Management", "Process Documentation"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.write"
    },
    {
      id: 4,
      name: "Patrick Miguel Andrade",
      role: "Project Manager",
      icon: Users,
      image: PatrickImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication. Focuses on agile methodologies to deliver high-quality products efficiently.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum", "Leadership", "Stakeholder Management", "Quality Assurance"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-800 rounded-full px-5 py-2 mb-6 shadow-lg border border-red-500/30">
            <Award className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              BSIT 4A - Group 4
            </span>
            <Star className="w-4 h-4 text-white" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Meet Our <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Dream Team</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            The passionate developers behind <span className="font-semibold text-red-400">CircuLink</span> - creating 
            innovative solutions for the Augustinian community.
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">4</div>
              <div className="text-xs text-gray-400 font-medium">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">24+</div>
              <div className="text-xs text-gray-400 font-medium">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">100%</div>
              <div className="text-xs text-gray-400 font-medium">Dedication</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">1</div>
              <div className="text-xs text-gray-400 font-medium">Mission</div>
            </div>
          </div>
        </div>

        {/* Enhanced Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group relative bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700/60 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Profile Header */}
                <div className="relative h-40 bg-gradient-to-br from-red-700 to-red-900">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-800 p-1.5 shadow-2xl group-hover:shadow-3xl transition-all duration-500 border-2 border-red-500/50">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-2 shadow-xl group-hover:scale-110 transition-transform duration-300 border border-red-500/30">
                        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-full p-1.5">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="pt-14 pb-6 px-5 text-center">
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-red-400 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-red-400 font-semibold text-sm mb-4 bg-red-900/30 px-3 py-1 rounded-full inline-block border border-red-500/20">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4 font-light">
                    {member.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-red-900/40 text-red-300 px-2 py-1 rounded-full text-xs font-medium border border-red-700/50 hover:border-red-500 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs font-medium hover:bg-gray-600 transition-colors duration-300">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Hover Action */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-700 transition-colors duration-300">
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Team Mission Section */}
        <div className="relative bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-gray-700/60 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
          </div>
          
          <div className="relative text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-6 leading-tight">
              Our Mission at <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">CircuLink</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto font-light text-sm">
              As fourth-year BS Information Technology students from the prestigious University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. CircuLink represents 
              our dedication to enhancing the library experience for the Augustinian community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="text-center group">
                <div className="w-14 h-14 bg-red-900/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-800/50 transition-colors duration-300 shadow-lg border border-red-700/30">
                  <Code className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">Innovation</h3>
                <p className="text-gray-400 font-light text-xs">Cutting-edge solutions</p>
              </div>
              <div className="text-center group">
                <div className="w-14 h-14 bg-red-900/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-800/50 transition-colors duration-300 shadow-lg border border-red-700/30">
                  <Users className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">Collaboration</h3>
                <p className="text-gray-400 font-light text-xs">Teamwork driven</p>
              </div>
              <div className="text-center group">
                <div className="w-14 h-14 bg-red-900/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-800/50 transition-colors duration-300 shadow-lg border border-red-700/30">
                  <Award className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">Excellence</h3>
                <p className="text-gray-400 font-light text-xs">Quality focused</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Enhanced Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Enhanced Modal Content */}
            <div className="relative bg-gray-800 rounded-2xl shadow-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-red-500/30">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-4 right-4 z-10 bg-gray-700/90 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl p-2 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-md hover:scale-110 border border-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Enhanced Left Side - Profile */}
                <div className="lg:w-2/5 bg-gradient-to-br from-red-800 to-red-900 p-6 text-white relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-white"></div>
                  </div>
                  
                  <div className="relative text-center lg:text-left">
                    <div className="w-32 h-32 mx-auto lg:mx-0 mb-6 rounded-full bg-gray-800 p-2 shadow-2xl border-2 border-red-500/50">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    
                    <h2 className="text-xl font-black mb-2">{activeMember.name}</h2>
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                      <activeMember.icon className="w-5 h-5" />
                      <span className="font-bold text-red-200 text-base">{activeMember.role}</span>
                    </div>
                    
                    <p className="text-red-200 leading-relaxed text-sm mb-6 font-light">
                      {activeMember.description}
                    </p>
                    
                    <div className="flex justify-center lg:justify-start space-x-3">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg border border-white/20"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg border border-white/20"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg border border-white/20"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Right Side - Details */}
                <div className="lg:w-3/5 p-6 overflow-y-auto max-h-[70vh]">
                  <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Skills & Expertise
                  </h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {activeMember.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-red-900/40 to-red-800/40 rounded-xl p-3 text-center border border-red-700/50 hover:border-red-500 hover:shadow-lg transition-all duration-300 group hover:scale-105"
                      >
                        <span className="font-bold text-white text-sm group-hover:text-red-300 transition-colors duration-300">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-700/50 to-red-900/30 rounded-xl p-5 border border-gray-600/50 shadow-lg">
                    <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-400" />
                      Get in Touch
                    </h4>
                    <div className="space-y-3">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl transition-all duration-300 w-full group hover:shadow-lg hover:scale-105 border border-gray-600"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-bold text-sm">GitHub Profile</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300 w-full group hover:shadow-lg hover:scale-105 border border-red-500"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="font-bold text-sm">Send Email</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-xl transition-all duration-300 w-full group hover:shadow-lg hover:scale-105 border border-red-600"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-bold text-sm">Visit Portfolio</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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