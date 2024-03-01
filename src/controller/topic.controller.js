export default class TopicController {

  static registerTopic(req,res){
    const { topicName } = req.body;
    if(!topicName) return res.status(400).json({ error: 'Missing parameter: `topicName`' });
    
  }

}