// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users } from "lucide-react";

function Developers() {
  const [activeMember, setActiveMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Patrick Miguel Andrade",
      role: "Lead Developer",
      icon: Code,
      image: "/assets/Profile/image1.jpg",
      description: "Full-stack developer specializing in React and Node.js. Responsible for system architecture and core functionality implementation.",
      skills: ["React", "Node.js", "MongoDB", "Express", "API Design"],
      github: "https://github.com/patrickandrade",
      email: "patrick.andrade@usa.edu.ph",
      portfolio: "https://patrickandrade.dev"
    },
    {
      id: 2,
      name: "Suheila Belle Morales",
      role: "UI/UX Designer",
      icon: Palette,
      image: "/assets/Profile/image2.jpg",
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.design"
    },
    {
      id: 3,
      name: "Louis Miguel Parenno",
      role: "Documentation Specialist",
      icon: FileText,
      image: "/assets/Profile/image3.jpg",
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.write"
    },
    {
      id: 4,
      name: "Stephen Madero Jr.",
      role: "Project Manager",
      icon: Users,
      image: "/assets/Profile/image4.jpg",
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Development Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Meet the talented BSIT 4A - Group 4 team behind CircuLink. 
              We're passionate about creating innovative solutions for the Augustinian community.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700 hover:border-purple-500/50"
                onClick={() => setActiveMember(member)}
              >
                <div className="p-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative mb-4">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 -z-10 blur-sm opacity-70"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl mb-2">{member.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-cyan-400">
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-semibold">{member.role}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed text-center">
                    {member.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Description */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-10 mb-8 border border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              BSIT 4A - Group 4
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
              We are a dedicated team of fourth-year BS Information Technology students from the 
              University of San Agustin. CircuLink represents our commitment to solving real-world 
              problems through technology and innovation. Our diverse skills and collaborative 
              approach ensure we deliver a high-quality library room reservation system that 
              serves the needs of the Augustinian community.
            </p>
          </div>
        </div>

        {/* Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <img
                      src={activeMember.image}
                      alt={activeMember.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 -z-10 blur-sm opacity-70"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{activeMember.name}</h3>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <activeMember.icon className="w-5 h-5" />
                      <span className="font-semibold">{activeMember.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMember(null)}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-2xl font-light"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed border-l-4 border-cyan-500 pl-4">
                  {activeMember.description}
                </p>

                <div className="mb-8">
                  <h4 className="font-semibold text-white mb-4 text-lg">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-3">
                    {activeMember.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={activeMember.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center shadow-lg hover:shadow-purple-500/20"
                  >
                    <Github className="w-5 h-5" />
                    <span className="font-medium">GitHub</span>
                  </a>
                  <a
                    href={`mailto:${activeMember.email}`}
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </a>
                  <a
                    href={activeMember.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-medium">Portfolio</span>
                  </a>
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