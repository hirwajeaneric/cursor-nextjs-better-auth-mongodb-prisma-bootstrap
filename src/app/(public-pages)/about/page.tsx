import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, Award, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Projects Completed", value: "50,000+", icon: <Target className="h-6 w-6" /> },
    { label: "Awards Won", value: "25+", icon: <Award className="h-6 w-6" /> },
    { label: "Team Members", value: "100+", icon: <Heart className="h-6 w-6" /> },
  ];

  const values = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible, embracing new technologies and creative solutions to solve complex problems."
    },
    {
      title: "Quality",
      description: "Every product we build undergoes rigorous testing and refinement to ensure it meets the highest standards of excellence."
    },
    {
      title: "Collaboration",
      description: "We believe the best solutions come from diverse teams working together with open communication and mutual respect."
    },
    {
      title: "Customer Focus",
      description: "Our customers are at the heart of everything we do. We listen, learn, and adapt to deliver exceptional value."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Visionary leader with 15+ years in tech, passionate about building products that make a difference.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Mike Chen",
      role: "CTO",
      description: "Technical architect and engineering leader, expert in scalable systems and modern development practices.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emily Davis",
      role: "Head of Design",
      description: "Creative director focused on user experience and beautiful, functional design that delights users.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Heart className="h-4 w-4 mr-2" />
              About Us
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Building the future,
              <span className="text-primary"> one idea at a time</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;re a passionate team of innovators, designers, and developers dedicated to creating 
              solutions that empower businesses and individuals to achieve their goals.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {stat.icon}
                  </div>
                  <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    {stat.label}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground">
                  To democratize technology and make powerful tools accessible to everyone, 
                  regardless of their technical background or company size.
                </p>
                <p className="text-lg text-muted-foreground">
                  We believe that great ideas shouldn&apos;t be limited by technical constraints. 
                  That&apos;s why we&apos;ve built a platform that&apos;s both powerful and intuitive, 
                  enabling anyone to bring their vision to life.
                </p>
                <Button size="lg">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Innovation First</h3>
                  <p className="text-muted-foreground">
                    We&apos;re always exploring new ways to solve problems and create value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The talented individuals who make everything possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 overflow-hidden">
                    <Image 
                      src={member.image} 
                      alt={member.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to work with us?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join our community of innovators and start building something amazing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                View Open Positions
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
