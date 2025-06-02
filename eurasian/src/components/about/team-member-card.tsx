import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { LinkedinIcon, TwitterIcon, BriefcaseIcon } from "lucide-react";

interface TeamMemberCardProps {
  name: string;
  title: string;
  expertise: string[];
  imageUrl: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
}

export default function TeamMemberCard({ name, title, expertise, imageUrl, bio, linkedin, twitter }: TeamMemberCardProps) {
  return (
    <Card className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <Image
          src={imageUrl}
          alt={name}
          width={128}
          height={128}
          className="rounded-full mx-auto mb-4 border-4 border-primary/20"
          data-ai-hint="person professional"
        />
        <CardTitle className="font-headline text-xl">{name}</CardTitle>
        <CardDescription className="text-primary flex items-center justify-center">
          <BriefcaseIcon className="h-4 w-4 mr-1" /> {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3">{bio}</p>
        <div className="mb-3">
          <h4 className="font-semibold text-sm mb-1">Expertise:</h4>
          <div className="flex flex-wrap justify-center gap-1">
            {expertise.map((skill, index) => (
              <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-3 mt-4">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <LinkedinIcon className="h-5 w-5" />
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <TwitterIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
