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
      bio: "Stephen is an aspiring web developer currently learning how to build modern, scalable applications using React and Node.js. He enjoys exploring new technologies, improving his coding skills, and creating simple projects to apply what he learns. With a growing passion for clean code and efficient design, Stephen is continuously learning best practices to become a confident full-stack developer.",
      skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "JavaScript", "HTML", "CSS"],
      github: "https://github.com/patrickandrade",
      email: "",
      portfolio: "",
      joinDate: "2024",
      location: "Janiuay, Iloilo City, Philippines",
      interests: [
        "Web Development",
        "React and Node.js",
        "UI/UX Design",
        "Learning New Technologies",
        "Building Scalable Applications",
        "Open-Source Projects",
        "Problem Solving",
        "Database Design",
        "Clean Code Practices"
      ],
      favoriteTech: [
        "React.js",
        "Node.js",
        "Express.js",
        "MongoDB",
        "JavaScript",
        "Tailwind CSS",
        "HTML5",
        "CSS3",
        "Git & GitHub"
      ],
    },
    {
      id: 2,
      name: "Louis Miguel Parenno",
      role: "UI/UX Designer",
      icon: Palette,
      image: LouisImage,
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing.",
      bio: "Louis brings designs to life with a user-centered approach, having worked on multiple digital products across various industries. He believes that great design should not only look beautiful but also solve real user problems effectively. His design philosophy centers around simplicity, accessibility, and emotional connection.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Design Systems", "User Testing", "Interaction Design", "Design Thinking"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.design",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
      interests: ["Design Systems", "User Psychology", "Digital Illustration", "Design Workshops"],
      favoriteTech: "Figma & Protopie"
    },
    {
      id: 3,
      name: "Suheila Belle Morales",
      role: "Documentation Specialist",
      icon: FileText,
      image: SuheilaImage,
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation.",
      bio: "Suheila transforms complex technical concepts into clear, accessible documentation that empowers users and developers alike. With a background in both technical writing and software development, she bridges the gap between technical teams and end-users. Her documentation has helped thousands of users navigate complex software systems with ease.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown", "Content Strategy", "Knowledge Management", "Process Documentation", "Information Architecture", "GitBook"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.write",
      joinDate: "2022",
      location: "Iloilo City, Philippines",
      interests: ["Technical Blogs", "User Education", "Content Strategy", "Knowledge Sharing"],
      favoriteTech: "Markdown & GitBook"
    },
    {
      id: 4,
      name: "Patrick Miguel Andrade",
      role: "Project Manager",
      icon: Users,
      image: PatrickImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication.",
      bio: "Patrick excels at bringing order to complex projects and ensuring teams work together efficiently. With certifications in Agile methodologies and years of experience managing tech projects, he ensures that CircuLink delivers value to users while maintaining high quality standards. His leadership style focuses on empowerment and clear communication.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum", "Leadership", "Stakeholder Management", "Quality Assurance", "JIRA", "Confluence"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
      interests: ["Agile Coaching", "Team Building", "Process Optimization", "Leadership"],
      favoriteTech: "JIRA & Confluence"
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

        {/* Enhanced Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-gray-900 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-3 right-3 md:top-6 md:right-6 z-10 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg md:rounded-xl p-2 md:p-3 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700"
              >
                <X className="w-4 h-4 md:w-6 md:h-6" />
              </button>

              <div className="flex flex-col lg:flex-row h-full">
                {/* Left Side - Enhanced Profile */}
                <div className="lg:w-2/5 bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-700">
                  <div className="text-center h-full flex flex-col">
                    {/* Large Profile Picture */}
                    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-2 shadow-2xl">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-900"
                      />
                    </div>
                    
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">{activeMember.name}</h2>
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
                      <activeMember.icon className="w-4 h-4 md:w-6 md:h-6 text-red-400" />
                      <span className="font-semibold text-red-400 text-lg md:text-xl">{activeMember.role}</span>
                    </div>
                    
                    {/* Personal Info Cards */}
                    <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                      <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400 mb-2">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                          <span>{activeMember.location}</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                          <span>Member since {activeMember.joinDate}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-300 mb-2">
                          <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                          Favorite Tools
                        </div>
                        <p className="text-xs md:text-sm text-gray-400">{activeMember.favoriteTech}</p>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-2 md:space-x-3 mt-auto">
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
                          className="bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg md:rounded-xl p-2 md:p-3 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700 hover:border-red-500/30"
                          title={social.label}
                        >
                          <social.icon className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Enhanced Details */}
                <div className="lg:w-3/5 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-[85vh]">
                  {/* Bio Section */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                      <Heart className="w-4 h-4 md:w-6 md:h-6 text-red-400" />
                      About Me
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
                      {activeMember.bio}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                      <Award className="w-4 h-4 md:w-6 md:h-6 text-red-400" />
                      Skills & Expertise
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                      {activeMember.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-800 to-gray-700 hover:from-red-500/20 hover:to-red-600/20 rounded-lg md:rounded-xl p-3 text-center border border-gray-700 hover:border-red-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        >
                          <span className="font-semibold text-gray-200 text-xs md:text-sm">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Contact Section */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700">
                    <h4 className="font-bold text-white text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                      <Users className="w-4 h-4 md:w-6 md:h-6 text-red-400" />
                      Get in Touch
                    </h4>
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { 
                          icon: Github, 
                          href: activeMember.github, 
                          label: "View GitHub Profile",
                          description: "Check out my projects and contributions",
                          bg: "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 border border-gray-600",
                          text: "text-white"
                        },
                        { 
                          icon: Mail, 
                          href: `mailto:${activeMember.email}`, 
                          label: "Send Email",
                          description: "Let's discuss potential collaborations",
                          bg: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border border-red-600",
                          text: "text-white"
                        },
                        { 
                          icon: ExternalLink, 
                          href: activeMember.portfolio, 
                          label: "Visit Portfolio",
                          description: "Explore my work and experience",
                          bg: "bg-gray-800 hover:bg-gray-700 border border-gray-600",
                          text: "text-white"
                        }
                      ].map((contact, index) => (
                        <a
                          key={index}
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-start gap-3 md:gap-4 ${contact.bg} ${contact.text} px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl transition-all duration-300 w-full group hover:shadow-lg`}
                        >
                          <div className="bg-white/10 rounded-lg p-1.5 md:p-2">
                            <contact.icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm md:text-base">{contact.label}</div>
                            <div className="text-xs md:text-sm opacity-80 mt-1">{contact.description}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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