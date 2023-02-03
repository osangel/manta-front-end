import { ChangeEvent, useState } from 'react';

import Icon from 'components/Icon';
import { useSBT } from 'pages/SBTPage/SBTContext';
import DotLoader from 'components/Loaders/DotLoader';

const UploadImg = () => {
  const [loading, toggleLoading] = useState(false);

  const { uploadImgs } = useSBT();

  const onImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files?.length) {
      toggleLoading(true);
      await uploadImgs([...e.target.files]);
      toggleLoading(false);
    }
  };
  const disabledStyle = loading
    ? 'brightness-50 cursor-not-allowed'
    : 'cursor-pointer';
  return (
    <div className="relative w-max">
      <div className="border border-dashed bg-primary rounded-lg w-48 h-48 flex justify-center items-center">
        {loading ? (
          <DotLoader cls="transform scale-200" />
        ) : (
          <Icon name="defaultImg" />
        )}
      </div>
      <input
        className={`opacity-0 absolute top-0 left-0 right-0 bottom-0 ${disabledStyle}`}
        type="file"
        multiple
        accept="image/*"
        onChange={onImageChange}
        disabled={loading}
      />
    </div>
  );
};

export default UploadImg;
