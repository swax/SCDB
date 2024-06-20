import { Box } from "@mui/material";
import Markdown from "react-markdown";

export default function HelpPage() {
  return (
    <Box className="about-page" sx={{ marginTop: 4 }}>
      <Markdown>{`
      
SketchTV.lol is a website where we're building a database of comdedy sketches.
There's no place on the internet that catalogs sketches to make them easy to find by category, person, year, etc...

Some shows like Human Giant seem to be impossible to find anywhere. 
Others are hidden in various large streaming sites, let's help people find them to enjoy again!

Help us grow by creating an account and adding your favorite sketches!
This site was created by [@swax](https://x.com/swax) an open source software engineer as a fun side project.
We have a [Discord server](https://discord.gg/UKE8gSYp) as well if you want to talk about sketches, improving the site, or anything else!
      
### Adding a Sketch

* Once you've logged in there is a link at the bottom of the [sketch list](/sketches) page to add a new sketch
* Red fields on the form are required
* There is a 'create' link in the show, season, character, etc.. drop downs to create those respective entries
* Sketch image
  * Try to pick an image with the most characters in it
* Cast images
  * You can use the , and . keys to move the video frame by frame on YouTube to get the best screenshot
  * The face of the character should be framed so that the face is in the upper half of the image with some margin on the sides
    * ![image](/images/cast-img-framing.jpg) 
* After saving changes the update should be immediate, but it can take up to 5 minutes for related pages to be updated
  
`}</Markdown>
    </Box>
  );
}
