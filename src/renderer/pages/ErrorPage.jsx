import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';

function ErrorPage() {
  return (
    <Wrapper>
      <Header title="Not connected 😢" />
      <p className="lead">Ooops, it seems you don't have internet connection</p>
      <p>An active internet connection is needed to install EmuDeck</p>
    </Wrapper>
  );
}

export default ErrorPage;
