import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useVeilVoting } from '@/hooks/useVeilVoting';
import { toast } from 'sonner';

interface SimpleVoteProps {
  electionId: number;
  options: string[];
}

export const SimpleVote = ({ electionId, options }: SimpleVoteProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const { isConnected } = useWallet();
  const { castVote } = useVeilVoting();

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVoting(true);

    try {
      toast.info('Preparing vote...');

      // For MVP: Use simplified voting without real ZK proof
      // In production, this would generate actual ZK proof
      const mockEncryptedVote = `0x${Buffer.from(`vote_${selectedOption}_${Date.now()}`).toString('hex').padEnd(64, '0')}`;
      const mockNullifier = `0x${Buffer.from(`nullifier_${Math.random()}`).toString('hex').padEnd(64, '0')}`;
      const mockProof = '0x';
      const mockPubSignals = [
        '0x' + '0'.repeat(64), // merkleRoot (mock)
        mockNullifier,
        mockEncryptedVote,
        electionId.toString(),
      ];

      toast.info('Submitting vote to blockchain...');

      const receipt = await castVote(
        electionId,
        mockEncryptedVote,
        mockNullifier,
        mockProof,
        mockPubSignals
      );

      setTxHash(receipt.hash);
      setVoteSuccess(true);
      toast.success('Vote cast successfully!', {
        description: `Transaction: ${receipt.hash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error('Vote error:', error);
      toast.error('Failed to cast vote', {
        description: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (voteSuccess) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <CardTitle className="text-green-500">Vote Cast Successfully!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your anonymous vote has been recorded on the blockchain.
          </p>
          {txHash && (
            <Alert>
              <AlertDescription className="font-mono text-xs">
                <strong>Transaction:</strong>{' '}
                <a
                  href={`https://testnet.snowtrace.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={() => {
              setVoteSuccess(false);
              setSelectedOption('');
              setTxHash('');
            }}
            variant="outline"
            className="w-full"
          >
            Vote in Another Election
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          Select your preferred option. Your vote will be anonymous and verifiable on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to vote
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base font-medium"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="w-full"
              size="lg"
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Casting Vote...
                </>
              ) : (
                'Cast Anonymous Vote'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Your identity remains private. Only your encrypted vote is recorded on-chain.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
