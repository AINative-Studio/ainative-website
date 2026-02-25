import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';

export const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Blog Posts
export const getBlogPosts = async (params = {}) => {
  try {
    const { data } = await strapi.get('/blog-posts', {
      params: {
        populate: '*',
        sort: 'published_date:desc',
        ...params
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

export const getBlogPost = async (slug: string) => {
  try {
    const { data } = await strapi.get('/blog-posts', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    return data.data[0];
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

// Tutorials
export const getTutorials = async (params = {}) => {
  try {
    const { data } = await strapi.get('/tutorials', {
      params: { populate: '*', ...params }
    });
    return data;
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    throw error;
  }
};

export const getTutorial = async (slug: string) => {
  try {
    const { data } = await strapi.get('/tutorials', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    return data.data[0];
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    throw error;
  }
};

// Showcases
export const getShowcases = async (params = {}) => {
  try {
    const { data } = await strapi.get('/showcases', {
      params: { populate: '*', ...params }
    });
    return data;
  } catch (error) {
    console.error('Error fetching showcases:', error);
    throw error;
  }
};

export const getShowcase = async (slug: string) => {
  try {
    const { data } = await strapi.get('/showcases', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    return data.data[0];
  } catch (error) {
    console.error('Error fetching showcase:', error);
    throw error;
  }
};

// Events
export const getEvents = async (params = {}) => {
  try {
    const { data } = await strapi.get('/events', {
      params: {
        populate: '*',
        sort: 'start_date:asc',
        ...params
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Resources
export const getResources = async (params = {}) => {
  try {
    const { data } = await strapi.get('/resources', {
      params: { populate: '*', ...params }
    });
    return data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Newsletter
export const subscribeNewsletter = async (email: string) => {
  try {
    const { data } = await strapi.post('/newsletters', {
      data: { email }
    });
    return data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

// Videos
export const getVideos = async (params = {}) => {
  try {
    const { data } = await strapi.get('/videos', {
      params: {
        populate: '*',
        sort: ['featured:desc', 'publishedAt:desc'],
        ...params
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

export const getVideo = async (slug: string) => {
  try {
    const { data } = await strapi.get('/videos', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    return data.data[0];
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

export const updateVideoViews = async (videoId: number, views: number) => {
  try {
    const { data } = await strapi.put(`/videos/${videoId}`, {
      data: { views }
    });
    return data;
  } catch (error) {
    console.error('Error updating video views:', error);
    throw error;
  }
};

export const updateVideoLikes = async (videoId: number, likes: number) => {
  try {
    const { data } = await strapi.put(`/videos/${videoId}`, {
      data: { likes }
    });
    return data;
  } catch (error) {
    console.error('Error updating video likes:', error);
    throw error;
  }
};

// Webinars
export const getWebinars = async (params = {}) => {
  try {
    const { data } = await strapi.get('/webinars', {
      params: {
        populate: ['speaker', 'co_speakers', 'video', 'thumbnail', 'tags', 'category'],
        sort: ['date:desc'],
        ...params
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching webinars:', error);
    throw error;
  }
};

export const getWebinar = async (slug: string) => {
  try {
    const { data } = await strapi.get('/webinars', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: ['speaker', 'co_speakers', 'video', 'thumbnail', 'tags', 'category']
      }
    });
    return data.data[0];
  } catch (error) {
    console.error('Error fetching webinar:', error);
    throw error;
  }
};

export const updateWebinarViews = async (webinarId: number, views: number) => {
  try {
    const { data } = await strapi.put(`/webinars/${webinarId}`, {
      data: { views }
    });
    return data;
  } catch (error) {
    console.error('Error updating webinar views:', error);
    throw error;
  }
};

export const updateWebinarAttendees = async (webinarId: number, attendees: number) => {
  try {
    const { data } = await strapi.put(`/webinars/${webinarId}`, {
      data: { current_attendees: attendees }
    });
    return data;
  } catch (error) {
    console.error('Error updating webinar attendees:', error);
    throw error;
  }
};
