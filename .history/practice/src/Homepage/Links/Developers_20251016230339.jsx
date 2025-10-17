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
      description: "I’m an aspiring Full-stack Developer currently learning React and Node.js. I’m passionate about building clean, responsive, and user-friendly applications while exploring how to make systems faster and more efficient. I enjoy learning new technologies and turning ideas into real, working projects.",
      skills: ["React", "Node.js", "MongoDB", "Express", "API Design", "TypeScript"],
      github: "https://github.com/patrickandrade",
      email: "patrick.andrade@usa.edu.ph",
      portfolio: "https://patrickandrade.dev"
    },
    {
      id: 2,
      name: "Louis Miguel Parenno",
      role: "UI/UX Designer",
      icon: Palette,
      image: LouisImage,
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing. Specializes in creating user-centered designs that bridge aesthetics and functionality.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Design Systems", "User Testing"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.design"
    },
    {
      id: 3,
      name: "Suheila Belle Morales",
      role: "Documentation Specialist",
      icon: FileText,
      image: SuheilaImage,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-sm border border-gray-200">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              BSIT 4A - Group 4
            </span>
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-blue-600">Team</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The passionate developers behind <span className="font-semibold text-blue-600">CircuLink</span> - 
            creating innovative solutions for the Augustinian community.
          </p>
          
          
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                {/* Profile Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-[50px] h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md">
                    <div className="bg-blue-100 rounded-full p-1.5">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-3 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {member.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-100">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission at <span className="text-blue-600">CircuLink</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              As fourth-year BS Information Technology students from the prestigious University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. CircuLink represents 
              our dedication to enhancing the library experience for the Augustinian community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Code, title: "Innovation", description: "Cutting-edge solutions" },
                { icon: Users, title: "Collaboration", description: "Teamwork driven" },
                { icon: Award, title: "Excellence", description: "Quality focused" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-lg p-2 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Profile */}
                <div className="lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-r border-gray-200">
                  <div className="text-center">
                    {/* Large Profile Picture */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white p-2 shadow-md border border-gray-200">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeMember.name}</h2>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <activeMember.icon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-600 text-lg">{activeMember.role}</span>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed text-sm mb-6">
                      {activeMember.description}
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-3">
                      {[
                        { icon: Github, href: activeMember.github, label: "GitHub" },
                        { icon: Mail, href: `mailto:${activeMember.email}`, label: "Email" },
                        { icon: ExternalLink, href: activeMember.portfolio, label: "Portfolio" }
                      ].map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg p-3 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                          title={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Details */}
                <div className="lg:w-3/5 p-8 overflow-y-auto max-h-[70vh]">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Skills & Expertise</h3>
                  
                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {activeMember.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 hover:bg-blue-50 rounded-lg p-3 text-center border border-gray-200 hover:border-blue-200 transition-all duration-200"
                      >
                        <span className="font-medium text-gray-700 text-sm">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Contact Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Get in Touch
                    </h4>
                    <div className="space-y-3">
                      {[
                        { 
                          icon: Github, 
                          href: activeMember.github, 
                          label: "View GitHub Profile",
                          bg: "bg-gray-800 hover:bg-gray-900",
                          text: "text-white"
                        },
                        { 
                          icon: Mail, 
                          href: `mailto:${activeMember.email}`, 
                          label: "Send Email",
                          bg: "bg-blue-600 hover:bg-blue-700",
                          text: "text-white"
                        },
                        { 
                          icon: ExternalLink, 
                          href: activeMember.portfolio, 
                          label: "Visit Portfolio",
                          bg: "bg-white hover:bg-gray-50 border border-gray-300",
                          text: "text-gray-700"
                        }
                      ].map((contact, index) => (
                        <a
                          key={index}
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 ${contact.bg} ${contact.text} px-4 py-3 rounded-lg transition-all duration-200 w-full group hover:shadow-md`}
                        >
                          <contact.icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{contact.label}</span>
                          <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </a>
                      ))}
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