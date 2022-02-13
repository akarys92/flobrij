import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service';
// Address of the SOL TLD

const SOL_TLD_AUTHORITY = new PublicKey(
    "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);
  
  
const getInputKey = async (input) => {
    let hashed_input_name = await getHashedName(input);
    let inputDomainKey = await getNameAccountKey(
        hashed_input_name,
        undefined,
        SOL_TLD_AUTHORITY
    );
    return { inputDomainKey: inputDomainKey, hashedInputName: hashed_input_name };
};

export default getInputKey; 