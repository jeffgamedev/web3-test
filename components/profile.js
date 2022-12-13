import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
  } from "wagmi";
  
  import { Network, Alchemy } from "alchemy-sdk";
  import styles from "../styles/Home.module.css";
  import React from "react";
  
  export function Profile() {
    const [nfts, updateNfts] = React.useState([]);
    const [dummy, updateDummy] = React.useState(false);
    const { address, connector, isConnected } = useAccount();
    const { data: ensAvatar } = useEnsAvatar({ address });
    const { data: ensName } = useEnsName({ address });
    const { connect, connectors, isLoading, pendingConnector } = useConnect();
    const { disconnect } = useDisconnect();
  
    const alchemySettings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
      network: Network.ETH_MAINNET,
    };
  
    const alchemy = new Alchemy(alchemySettings);
  
    if (isConnected || dummy) {
      if (nfts.length == 0) {
        alchemy.nft
          .getNftsForOwner(
            address ? address : "0x5e765C6A318502FF2F6eF0D951e84F8dAE7FA3c9"
          )
          .then((obj) => {
            console.log(obj["ownedNfts"]);
            updateNfts(obj["ownedNfts"]);
          });
      }
      return (
        <div>
          {address && (
            <div>
              <img src={ensAvatar} alt="ENS Avatar" />
              <div>{ensName ? `${ensName} (${address})` : address}</div>
              <div>Connected to {connector.name}</div>
              <button onClick={disconnect}>Disconnect</button>
            </div>
          )}
          <div className={styles.grid}>
            {nfts.map((nft) => (
              <div className={styles.card} key={JSON.stringify(nft)}>
                <p>
                  {nft.title}
                  <br />
                  {nft.contract.symbol}
                  <br />
                  {nft.tokenId}
                </p>
                {nft.media.length > 0 && nft.media[0].raw && (
                  <img width="30%" src={nft.media[0].raw}></img>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  
    return (
      <div>
        <div>
          {connectors.map((connector) => (
            <button
              suppressHydrationWarning
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              {connector.name}
              {!connector.ready && " (unsupported)"}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                " (connecting)"}
            </button>
          ))}
          <button key="dummy" onClick={() => updateDummy(true)}>
            Load Dummy Address
          </button>
        </div>
      </div>
    );
  }
  