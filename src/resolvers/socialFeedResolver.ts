import SocialFeed from '../models/SocialFeed';
import User from '../models/User';

export const socialFeedResolvers = {
  Query: {
    getSocialFeed: async () => {
      return await SocialFeed.find().sort({ createdAt: -1 });
    },
    getFeedPost: async (_: any, { id }: { id: string }) => {
      return await SocialFeed.findById(id);
    },
  },
  Mutation: {
    createFeedPost: async (_: any, { input }: any) => {
      const post = new SocialFeed({
        ...input,
        likes: [],
        comments: [],
        createdAt: new Date(),
      });
      return await post.save();
    },
    updateFeedPost: async (_: any, { id, input }: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const post = await SocialFeed.findById(id);
      if (!post) throw new Error('Post not found');
      if (!post.user.equals(user.userId)) throw new Error('Not authorized to update this post');
      // Only update allowed fields
      if (input.content !== undefined) post.content = input.content;
      if (input.image !== undefined) post.image = input.image;
      if (input.activityType !== undefined) post.activityType = input.activityType;
      if (input.activityValue !== undefined) post.activityValue = input.activityValue;
      await post.save();
      return post;
    },
    deleteFeedPost: async (_: any, { id }: { id: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const post = await SocialFeed.findById(id);
      if (!post) throw new Error('Post not found');
      if (!post.user.equals(user.userId)) throw new Error('Not authorized to delete this post');
      await SocialFeed.findByIdAndDelete(id);
      return true;
    },
    likeFeedPost: async (_: any, { id }: { id: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const post = await SocialFeed.findById(id);
      if (!post) throw new Error('Post not found');
      const userId = user.userId;

      const alreadyLiked = post.likes.some((likeId: any) => likeId.equals(userId));
      if (alreadyLiked) {
        // Unlike
        post.likes = post.likes.filter((likeId: any) => !likeId.equals(userId));
      } else {
        // Like
        post.likes.push(userId);
      }
      await post.save();
      return post;
    },
    commentFeedPost: async (
      _: any,
      { id, comment }: { id: string; comment: string },
      { user }: { user?: any }
    ) => {
      if (!user) throw new Error('Authentication required');
      const feedPost = await SocialFeed.findById(id);
      if (!feedPost) throw new Error('Post not found');
      const commentObj = {
        user: user.userId, // userId from context
        comment,
        createdAt: new Date(),
      };
      feedPost.comments.push(commentObj);
      await feedPost.save();
      return feedPost;
    },
  },
  FeedPost: {
    user: async (parent: any) => await User.findById(parent.user),
    comments: (parent: any) => parent.comments,
    likes: (parent: any) => parent.likes.length,
    likedByCurrentUser: (parent: any, _: any, { user }: { user?: any }) => {
      if (!user) return false;
      return parent.likes.some((likeId: any) => likeId.equals(user.userId));
    },
  },
  FeedComment: {
    user: async (parent: any) => {
      return await User.findById(parent.user);
    },
  },
};