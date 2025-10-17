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
      name: "Patrick Miguel Andrade",
      role: "Lead Developer",
      icon: Code,
      image: PatrickImage,
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
      name: "Stephen Madero Jr.",
      role: "Project Manager",
      icon: Users,
      image: StephenImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication. Focuses on agile methodologies to deliver high-quality products efficiently.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum", "Leadership", "Stakeholder Management", "Quality Assurance"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Enhanced Header */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full px-6 py-3 mb-8 shadow-lg">
            <Award className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              BSIT 4A - Group 4
            </span>
            <Star className="w-5 h-5 text-white" />
          </div>
          
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
            Meet Our <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dream Team</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-light">
            The passionate developers behind <span className="font-semibold text-blue-600">CircuLink</span> - creating 
            innovative solutions for the Augustinian community through cutting-edge technology and seamless collaboration.
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <div className="text-sm text-gray-600 font-medium">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24+</div>
              <div className="text-sm text-gray-600 font-medium">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium">Dedication</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">1</div>
              <div className="text-sm text-gray-600 font-medium">Mission</div>
            </div>
          </div>
        </div>

        {/* Enhanced Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mb-24">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 cursor-pointer border border-gray-200/60 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Profile Header */}
                <div className="relative h-56 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-4 border-white group-hover:border-blue-200 transition-colors duration-500"
                        />
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-3 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="pt-20 pb-8 px-8 text-center">
                  <h3 className="font-bold text-gray-900 text-2xl mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-semibold text-base mb-5 bg-purple-50 px-4 py-2 rounded-full inline-block">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 font-light">
                    {member.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200/50 hover:border-blue-300 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors duration-300">
                        +{member.skills.length - 4}
                      </span>
                    )}
                  </div>
                  
                  {/* Hover Action */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                      <span>View Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Team Mission Section */}
        <div className="relative bg-white rounded-4xl shadow-2xl p-16 mb-16 border border-gray-200/60 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
          </div>
          
          <div className="relative text-center max-w-6xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
              Our Mission at <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CircuLink</span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-5xl mx-auto font-light">
              As fourth-year BS Information Technology students from the prestigious University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. CircuLink represents 
              our dedication to enhancing the library experience for the Augustinian community with a modern, 
              efficient, and user-friendly room reservation system that sets new standards in digital campus solutions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300 shadow-lg">
                  <Code className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Innovation</h3>
                <p className="text-gray-600 font-light">Cutting-edge solutions that push boundaries</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300 shadow-lg">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Collaboration</h3>
                <p className="text-gray-600 font-light">Teamwork driven by shared vision</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors duration-300 shadow-lg">
                  <Award className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Excellence</h3>
                <p className="text-gray-600 font-light">Quality focused with precision</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Enhanced Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-opacity duration-500"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Enhanced Modal Content */}
            <div className="relative bg-white rounded-4xl shadow-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-300/50">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-8 right-8 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-2xl p-3 transition-all duration-300 shadow-2xl hover:shadow-3xl backdrop-blur-md hover:scale-110"
              >
                <X className="w-7 h-7" />
              </button>

              <div className="flex flex-col xl:flex-row">
                {/* Enhanced Left Side - Profile */}
                <div className="xl:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 text-white relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-white"></div>
                  </div>
                  
                  <div className="relative text-center xl:text-left">
                    <div className="w-40 h-40 mx-auto xl:mx-0 mb-8 rounded-full bg-white p-3 shadow-3xl">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover border-4 border-white"
                      />
                    </div>
                    
                    <h2 className="text-3xl font-black mb-3">{activeMember.name}</h2>
                    <div className="flex items-center justify-center xl:justify-start gap-3 mb-8">
                      <activeMember.icon className="w-6 h-6" />
                      <span className="font-bold text-blue-100 text-lg">{activeMember.role}</span>
                    </div>
                    
                    <p className="text-blue-100 leading-relaxed text-lg mb-12 font-light">
                      {activeMember.description}
                    </p>
                    
                    <div className="flex justify-center xl:justify-start space-x-5">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
                      >
                        <Github className="w-6 h-6" />
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="bg-white/20 hover:bg-white/30 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
                      >
                        <Mail className="w-6 h-6" />
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
                      >
                        <ExternalLink className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Right Side - Details */}
                <div className="xl:w-3/5 p-12 overflow-y-auto max-h-[80vh]">
                  <h3 className="text-4xl font-black text-gray-900 mb-10 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Skills & Expertise
                  </h3>
                  
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                    {activeMember.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 text-center border-2 border-gray-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-500 group hover:scale-105"
                      >
                        <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border-2 border-gray-200/50 shadow-lg">
                    <h4 className="font-black text-gray-900 text-2xl mb-8 flex items-center gap-3">
                      <Users className="w-7 h-7 text-blue-600" />
                      Get in Touch
                    </h4>
                    <div className="space-y-5">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-2xl transition-all duration-500 w-full group hover:shadow-2xl hover:scale-105"
                      >
                        <Github className="w-6 h-6" />
                        <span className="font-bold text-lg">View GitHub Profile</span>
                        <ExternalLink className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-500 w-full group hover:shadow-2xl hover:scale-105"
                      >
                        <Mail className="w-6 h-6" />
                        <span className="font-bold text-lg">Send Email</span>
                        <ExternalLink className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-500 w-full group hover:shadow-2xl hover:scale-105"
                      >
                        <ExternalLink className="w-6 h-6" />
                        <span className="font-bold text-lg">Visit Portfolio</span>
                        <ExternalLink className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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