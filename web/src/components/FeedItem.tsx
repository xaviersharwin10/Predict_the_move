// FeedItem.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon, MessageCircleIcon, RepeatIcon, BookmarkIcon } from "lucide-react";

type FeedItemProps = {
  author: string;
  content: string;
  time: string;
};

export const FeedItem = ({ author, content, time }: FeedItemProps) => {
  return (
    <Card className="w-full mb-4 bg-white mx-0 dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="/placeholder-user.jpg" alt={author} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>
        <p className="text-lg">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between px-4 py-2 border-t">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <HeartIcon className="h-4 w-4 mr-1" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <MessageCircleIcon className="h-4 w-4 mr-1" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <RepeatIcon className="h-4 w-4 mr-1" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <BookmarkIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
