import { useEffect, useState } from 'react';
import { CustomSprite } from '../../components/CustomSprite/CustomSprite';
import { ImageInfo } from '../../models/ImageInfo';
import { Image } from '../../models/Image';
import { fetchData } from '../../utils/fetchData';
import restoreIcon from "../../assets/restore-icon.svg";
import arrowBackUp from "../../assets/arrow-back-up.svg";
import './Home.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Button, Toast, ToastContainer } from 'react-bootstrap';

export const Home = () => {
  const [gridDimensions, setGridDimensions] = useState({ columns: 3, rows: 3 });
  const [storedImages, setStoredImages] = useLocalStorage<Image[]>('images', []);
  const [storedHistory, setStoredHistory] = useLocalStorage<Image[]>('history', []);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const initData = async (): Promise<void> => {
      if (!storedImages.length) {
        // Getting data from json
        const imagesInfo = await fetchData<ImageInfo[]>('images.json');
        const images = imagesInfo.map(imageInfo => ({ imageInfo, imageState: { blur: 0, deleted: false } }))
        setStoredImages(images);
      }

      // Adjust the number of columns based on window size
      const updateGridDimensions = () => {
        const columns = Math.floor(window.innerWidth / 300);
        const rows = Math.floor(window.innerHeight / 300);
        setGridDimensions({ columns, rows })
      };

      window.addEventListener('resize', updateGridDimensions);

      // Initial call to adjust on load
      updateGridDimensions();
    };

    initData();
  }, []);

  // Remove image from list
  const removeImage = (uuid: string) => {
    setStoredHistory([...storedHistory, storedImages.find(({ imageInfo }) => imageInfo.uuid == uuid)!]);
    setStoredImages(storedImages.map(image => ({ ...image, imageState: { ...image.imageState, deleted: image.imageInfo.uuid == uuid ? true : image.imageState.deleted } })))
  }

  // Add blur effect on image
  const changeBlur = (uuid: string, blur: boolean) => {
    setStoredHistory([...storedHistory, storedImages.find(({ imageInfo }) => imageInfo.uuid == uuid)!]);
    setStoredImages(storedImages.map(image => ({ ...image, imageState: { ...image.imageState, blur: image.imageInfo.uuid == uuid ? (blur ? 5 : 0) : image.imageState.blur } })))
  }

  // Reset all images of the list
  const resetAll = async () => {
    const imagesInfo = await fetchData<ImageInfo[]>('images.json');
    const images = imagesInfo.map(imageInfo => ({ imageInfo, imageState: { blur: 0, deleted: false } }))
    setStoredImages(images);
  }

  // Undo changes
  const undo = () => {
    if (storedHistory.length) {
      const lastChange = storedHistory.slice().reverse()[0];
      setStoredImages(storedImages.map(image => image.imageInfo.uuid == lastChange.imageInfo.uuid ? lastChange : image));
      setStoredHistory(storedHistory.slice(0, storedHistory.length - 1))
    } else {
      setShowToast(true);
    }
  }

  // Show images of the list
  const showImages = () => {
    const filteredImages = storedImages.filter(({ imageState }) => !imageState.deleted);
    return filteredImages.length ? filteredImages.map((item) => <CustomSprite key={item.imageInfo.uuid} image={item} removeImageFn={removeImage} changeBlurFn={changeBlur}></CustomSprite>) : (<div className="py-5"><h5>No images available</h5></div>)
  }

  return (<main className="mt-lg-5 pt-lg-5">
    <div className="container pt-5">
      <div className="main-actions">
        <Button variant="light" onClick={resetAll}>
          <img src={restoreIcon} />
          <span>Reset all</span>
        </Button>
        <Button variant="light" onClick={undo}>
          <img src={arrowBackUp} />
          <span>Undo</span>
        </Button>
      </div>
      <div className="grid-container" style={{ gridTemplateColumns: `repeat(${gridDimensions.columns}, 1fr)`, gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)` }}>
        {showImages()}
      </div>
    </div>
    <ToastContainer className="position-fixed bottom-0 end-0 p-5">
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} bg={'dark'} autohide>
        <Toast.Header>
          <strong className="me-auto">Info</strong>
        </Toast.Header>
        <Toast.Body className="text-white">Last change reached</Toast.Body>
      </Toast>
    </ToastContainer>
  </main>)
}
