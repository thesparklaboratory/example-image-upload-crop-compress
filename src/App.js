import React, { useState } from "react";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  CssBaseline,
  Container,
  Grid,
  GridList,
  GridListTile,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography
} from '@material-ui/core'
import ImageBlobReduce from "image-blob-reduce";

const useStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
}));

export default function App() {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [pending, setPending] = useState([]);
  const [cropper, setCropper] = useState();

  const getImage = (file) => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.addEventListener('error', e => {
        reject(e);
      });
      fr.readAsDataURL(file);
    });
  };

  const onComplete = async () => {
    const blob = await (new Promise((resolve, reject) => {
      cropper.getCroppedCanvas().toBlob(resolve);;
    }));
    const resize = new ImageBlobReduce();
    const image = await resize.toCanvas(blob, { max: 600 });
    setImages([image, ...images]);

    const newPending = [...pending];
    newPending.shift();
    if (newPending.length === 0) {
      setDialogOpen(false);
    }
    setPending(newPending);
  };

  const onDrop = async (files) => {
    if (files.length) {
      console.log('number of files', files.length);
      setPending(await Promise.all(files.map(file => getImage(file))));
      setDialogOpen(true);
    }
  };

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <Paper>
        <Typography variant="h1">Image Crop, Resize, Compress Example</Typography>
        <Dropzone accept="image/*" onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} style={{
                backgroundColor: 'lightgray',
                minHeight: 100,
              }}>
                <input {...getInputProps()} />
                <Typography align="center">You can upload or drop your images here</Typography>
              </div>
            </section>
          )}
        </Dropzone>
        <GridList className={classes.gridList} cols={4}>
          {images.map((image, index) => (
            <GridListTile key={index} spacing={1}>
              <img src={image.toDataURL()} />
            </GridListTile>
          ))}
        </GridList>
        <Typography>To upload the contents of the images after they have been generated and cropped, you would then take the <strong>images</strong> state, and call <strong>.toBlob(callback)</strong> on each one and upload the result to S3</Typography>
      </Paper>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          <Typography variant="h3">Crop and Size Photos</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            After making your changes on each image, press the save button to move onto the next image. Once all images have been completed, the dialog will close.
          </DialogContentText>
          <GridList className={classes.gridList} cols={4} spacing={1}>
            {pending.map((image, index) => (
              <GridListTile key={index}>
                <img src={image} />
              </GridListTile>
            ))}
          </GridList>
          <Cropper
            style={{ height: 400, width: "100%" }}
            src={pending[0]}
            onInitialized={(instance) => {
              setCropper(instance);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={onComplete}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
