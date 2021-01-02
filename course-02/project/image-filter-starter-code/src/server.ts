import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, validURL } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', async (req: Request, res: Response) => {
    const { image_url: url } = req.query

    if (!url) {
      return res.status(400).send('image_url param is required')
    } else if (!validURL(url)) {
      return res.status(400).send('url is invalid')
    }

    try {
      const imagePath = await filterImageFromURL(url)
      res.on('finish', async () => {
        await deleteLocalFiles([imagePath])
      }).sendFile(imagePath)
    } catch (err) {
      console.error('failed to filter image from url', err)
      return res.sendStatus(500)
    }
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();