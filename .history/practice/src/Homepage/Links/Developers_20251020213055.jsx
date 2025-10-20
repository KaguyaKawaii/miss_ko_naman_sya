// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users, X, Star, Award, Zap, Calendar, MapPin, BookOpen, Heart } from "lucide-react";

// Import images
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
      description: "I'm an aspiring Full-stack Developer currently learning React and Node.js. I'm passionate about building clean, responsive, and user-friendly applications while exploring how to make systems faster and more efficient.",
      bio: "Stephen is an aspiring web developer currently learning how to build modern, scalable applications using React and Node.js. He enjoys exploring new technologies, improving his coding skills, and creating simple projects to apply what he learns.",
      skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "JavaScript"],
      github: "https://github.com/patrickandrade",
      email: "stephen@example.com",
      portfolio: "",
      joinDate: "2024",
      location: "Janiuay, Iloilo City, Philippines",
    },
    {
      id: 2,
      name: "Louis Miguel Parenno",
      role: "UI/UX Designer",
      icon: Palette,
      image: LouisImage,
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing.",
      bio: "Louis brings designs to life with a user-centered approach, having worked on multiple digital products across various industries.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing"],
      github: "https://github.com/suheilamorales",
      email: "louis@example.com",
      portfolio: "https://louis.design",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
    },
    {
      id: 3,
      name: "Suheila Belle Morales",
      role: "Documentation Specialist",
      icon: FileText,
      image: SuheilaImage,
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation.",
      bio: "Suheila transforms complex technical concepts into clear, accessible documentation that empowers users and developers alike.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown"],
      github: "https://github.com/louisparenno",
      email: "suheila@example.com",
      portfolio: "https://suheila.write",
      joinDate: "2022",
      location: "Iloilo City, Philippines",
    },
    {
      id: 4,
      name: "Patrick Miguel Andrade",
      role: "Project Manager",
      icon: Users,
      image: PatrickImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication.",
      bio: "Patrick excels at bringing order to complex projects and ensuring teams work together efficiently.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum"],
      github: "https://github.com/stephenmadero",
      email: "patrick@example.com",
      portfolio: "https://patrick.pm",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3 mb-6 border border-red-900/50">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            <span className="text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wide">
              BSIT 4A - Group 4
            </span>
            <Star className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet Our <span className="text-red-500">Team</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The passionate developers behind <span className="font-semibold text-red-500">CircuLink</span> - 
            creating innovative solutions for the Augustinian community.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-700/50 hover:border-red-500/30 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                {/* Profile Image */}
                <div className="relative h-[12rem] md:h-[15rem] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-1 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-900"
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-gray-900 rounded-full p-2 shadow-lg border border-gray-700">
                    <div className="bg-red-500/20 rounded-full p-1.5">
                      <IconComponent className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="p-4 md:p-6 text-center">
                  <h3 className="font-bold text-white text-lg md:text-xl mb-2">
                    {member.name}
                  </h3>
                  <p className="text-red-400 font-semibold text-xs md:text-sm mb-3 bg-red-500/10 px-3 py-1 rounded-full inline-block border border-red-500/20">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                    {member.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs font-medium hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 border border-gray-600/50"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full text-xs font-medium border border-gray-600/50">
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
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 mb-8 md:mb-12 border border-gray-700/50">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-red-500/30">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
              Our Mission at <span className="text-red-500">CircuLink</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6 md:mb-8 text-sm md:text-base">
              As fourth-year BS Information Technology students from the prestigious University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. CircuLink represents 
              our dedication to enhancing the library experience for the Augustinian community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: Code, title: "Innovation", description: "Cutting-edge solutions" },
                { icon: Users, title: "Collaboration", description: "Teamwork driven" },
                { icon: Award, title: "Excellence", description: "Quality focused" }
              ].map((item, index) => (
                <div key={index} className="text-center bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700/50 hover:border-red-500/30 transition-colors duration-300">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-red-500/20 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-red-500/30">
                    <item.icon className="w-5 h-5 md:w-7 md:h-7 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-white text-base md:text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simplified Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content - Simplified */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl p-2 transition-all duration-200 shadow-lg border border-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Large Profile Image */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-3 shadow-2xl mb-6">
                    <img
                      src={activeMember.image}
                      alt={activeMember.name}
                      className="w-full h-full rounded-full object-cover border-4 border-gray-900"
                    />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white text-center mb-2">
                    {activeMember.name}
                  </h2>
                  <div className="flex items-center gap-3 mb-4">
                    <activeMember.icon className="w-6 h-6 text-red-400" />
                    <span className="font-semibold text-red-400 text-xl">
                      {activeMember.role}
                    </span>
                  </div>
                </div>

                {/* Simple Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-red-400" />
                    <span>{activeMember.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-red-400" />
                    <span>Member since {activeMember.joinDate}</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {activeMember.bio}
                  </p>
                </div>

                {/* Simple Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-red-400" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeMember.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simple Contact */}
                <div className="flex justify-center space-x-4 pt-4 border-t border-gray-700">
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
                      className="bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl p-3 transition-all duration-200 shadow-lg border border-gray-700 hover:border-red-500"
                      title={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
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