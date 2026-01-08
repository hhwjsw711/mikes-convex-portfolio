import { Tweet } from "react-tweet";
import type { Doc } from "../../convex/_generated/dataModel";

interface TweetCardProps {
  tweet: Doc<"tweets">;
}

export function TweetCard({ tweet }: TweetCardProps) {
  return <Tweet id={tweet.tweetId} />;
}
