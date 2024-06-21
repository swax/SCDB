import { buildPageTitle } from "@/shared/utilities";
import { Box } from "@mui/material";
import { Metadata } from "next";
import Markdown from "react-markdown";

export const metadata: Metadata = {
  title: buildPageTitle("About"),
  description: "About the SketchTV.lol website",
};

export default function HelpPage() {
  // Rendering
  return (
    <>
      <Box className="about-page" sx={{ marginTop: 4 }}>
        <Markdown>{`
### About

SketchTV.lol is all about building a database of comedy sketches. 
There's no place on the internet that catalogs individual sketches to make them easy to find by category, person, year, etc...

Some sketches seem to be impossible to find anywhere. 
Others are hidden on various large streaming sites, let's help people find them to enjoy again.

Create an account to add your favorite sketches.
We have a [Discord server](https://discord.gg/UKE8gSYp) as well if you want to collaborate;
like trying to find and add sketches with a particular theme.

### Adding a Sketch

* Once you've logged in there is a link at the bottom of the [sketch list](/sketches) page to add a new sketch
* Red fields on the form are required
* There is a 'create' link in the show, season, character, etc.. drop downs to create those respective entries

### Adding Images

* Sketch image
  * Try to pick an image with the most characters in it
* Cast images
  * You can use the , and . keys to move the video frame by frame on YouTube to get the best screenshot
  * The face of the character should be framed so that the face is in the upper half of the image with some margin on the sides
    * ![image](/images/cast-img-framing.jpg) 

### Saving Changes

* After saving, the page update should be immediately. It can take up to 5 minutes for linked pages to be updated
* To edit a sketch, click the pencil icon in the upper right
* To view a sketch after saving, click the eye icon in the upper right
  
### Credits

This site was created by [@swax](https://x.com/swax) as a fun open source side project.
      
The source code is available on [GitHub](https://github.com/swax/SCDB). 
Discord is where we discuss new feature ideas and bug fixes. 
It's also a great resource for learning how to build a full stack web application with Next.js, Prisma, and PostgreSQL.

`}</Markdown>
      </Box>
    </>
  );
}
