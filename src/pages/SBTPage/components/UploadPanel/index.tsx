import { memo, UIEvent, useEffect, useMemo, useRef, useState } from 'react';

import Icon from 'components/Icon';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useFaceRecognition } from 'pages/SBTPage/SBTContext/faceRecognitionContext';
import DotLoader from 'components/Loaders/DotLoader';
import UploadImg from '../UploadImg';
import ButtonWithSignerAndWallet from '../ButtonWithSignerAndWallet';

export const MAX_UPLOAD_LEN = 20;
const MIN_UPLOAD_LEN = 5;

const UploadItem = memo(function UploadItem({
  file,
  index
}: {
  file: File;
  index: number;
}) {
  const { handleRemove, checkInvalid } = useFaceRecognition();

  const imgUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const invalid = checkInvalid(index);
  const inValidStyle = invalid ? '' : 'hidden group-hover:block';

  return (
    <div className="relative w-max group" key={index}>
      <img src={imgUrl} className="rounded-lg w-52 h-52 img-bg" />
      <Icon
        onClick={() => {
          handleRemove(index);
        }}
        name="close"
        className={`absolute ${inValidStyle} -right-3 -top-3  cursor-pointer`}
      />
      {invalid && (
        <Icon
          name="invalid"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
});

const TipComponent = () => {
  const { imgList } = useSBT();
  const { errorMsg } = useFaceRecognition();

  const maxLenInfo = useMemo(() => {
    if (imgList.length >= MAX_UPLOAD_LEN) {
      return 'You have exceeded the 20 pictures limit. We only support 20 pictures at maximum for the AI analysis.';
    }
    return '';
  }, [imgList?.length]);

  if (errorMsg) {
    return (
      <p className="absolute flex top-48 text-error text-xs">
        <Icon name="information" className="mr-2" />
        {errorMsg}
      </p>
    );
  }
  if (maxLenInfo) {
    return (
      <p className="absolute flex top-48 text-tip text-xs">
        <Icon name="information" className="mr-2" />
        {maxLenInfo}
      </p>
    );
  }
  return null;
};

const Cover = () => <div className="upload-img-cover" />;

const BtnComponent = ({ detectLoading }: { detectLoading: boolean }) => {
  return (
    <>
      {detectLoading ? 'Refreshing' : 'Confirm'}
      {detectLoading && <DotLoader cls="transform scale-150 ml-4" />}
    </>
  );
};

const UploadPanel = () => {
  const [showCover, toggleCover] = useState(false);

  const imgContainer = useRef<HTMLDivElement>(null);

  const { setCurrentStep, imgList } = useSBT();
  const { modelsLoaded, detectFaces, errorMsg, getGender, detectLoading } =
    useFaceRecognition();

  useEffect(() => {
    if (!imgContainer?.current || !modelsLoaded) {
      return;
    }

    detectFaces(imgContainer);
  }, [detectFaces, imgList, modelsLoaded]);

  const toThemePage = async () => {
    setCurrentStep(Step.Theme);
    getGender();
  };

  const btnDisabled = useMemo(() => {
    return (
      imgList.length < MIN_UPLOAD_LEN ||
      imgList.length > MAX_UPLOAD_LEN ||
      !!errorMsg ||
      detectLoading
    );
  }, [imgList, errorMsg, detectLoading]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 0) {
      toggleCover(true);
    } else {
      toggleCover(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col mx-auto mb-8 bg-secondary rounded-xl p-6 w-75 relative">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl font-red-hat-mono tracking-widest font-medium">
          zkSBT
        </h2>
      </div>
      <h1 className="text-3xl my-6">Upload Photos</h1>
      <p className="text-sm text-opacity-60 text-white">
        Please upload at least 5 selfies. Adding more photos will produce a
        better zkSBT. Please make sure the image clearly depicts your face.
        Avoid using any images that have other faces in them. Please also make
        sure the background is clean. This will ensure the best generation of
        your zkSBT.
      </p>
      <TipComponent />
      <div
        className="grid w-full gap-6 grid-cols-5 mb-16 pt-4 mt-9 max-h-51vh overflow-y-auto relative"
        ref={imgContainer}
        onScroll={handleScroll}>
        {imgList?.map(({ file }, index) => {
          if (!file) {
            return null;
          }
          return (
            <UploadItem file={file} index={index} key={index + file.name} />
          );
        })}
        {imgList.length < MAX_UPLOAD_LEN ? <UploadImg /> : null}
        {showCover && <Cover />}
      </div>
      <ButtonWithSignerAndWallet
        btnComponent={<BtnComponent detectLoading={detectLoading} />}
        onClick={toThemePage}
        disabled={btnDisabled}
        className={
          'flex items-center absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-4 left-1/2 -translate-x-1/2 transform'
        }
      />
    </div>
  );
};

export default UploadPanel;
