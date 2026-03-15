import { getAgents as fetchAgents } from './dbUtils';

const getAgents = async (_req, res, next) => {
  try {
    const agents = await fetchAgents();
    res.json({
      agents: agents.map((a) => ({
        id: a.id,
        firstName: a.first_name,
        lastName: a.last_name,
        email: a.email,
        pictureUrl: a.picture_url,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export default getAgents;
