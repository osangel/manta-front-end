import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import MantaIcon from 'resources/images/manta.png';
import sbtImgs from 'resources/images/sbt';

const Home = () => {
  const { setCurrentStep } = useSBT();
  const toUpload = () => {
    setCurrentStep(Step.Upload);
  };
  return (
    <div className="flex flex-col items-center mx-auto mb-32 bg-secondary rounded-xl p-14 w-75">
      <img className="w-20 h-20" src={MantaIcon} alt="Manta" />
      <h2 className="text-white text-6xl mt-6 mb-4">MANTA SBT</h2>
      <div className="text-warning border border-warning bg-light-warning rounded-xl px-4 py-2">
        🔥 Time Limited Free Generate Campaign Now 🔥
      </div>
      <div className="grid gap-6 grid-cols-9 grid-rows-3 w-full justify-between mt-8 mb-20">
        {sbtImgs.map((item, index) => {
          return (
            <img
              className="w-24 h-24 rounded-xl cursor-pointer hover:scale-200 transform duration-200 hover:z-10"
              key={index}
              src={item}
            />
          );
        })}
      </div>
      <button
        onClick={toUpload}
        className="px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter">
        Mint your AI SBT
      </button>
    </div>
  );
};

export default Home;