import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Shield, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VotingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  electionTitle: string;
}

const STEPS = ["Eligibility", "Selection", "Generating Proof", "Confirm"];

export const VotingModal = ({
  open,
  onOpenChange,
  electionTitle,
}: VotingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [txHash] = useState("0xabcd...ef12");
  const { toast } = useToast();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleVerifyEligibility = () => {
    setCurrentStep(1);
  };

  const handleSelectOption = () => {
    if (!selectedOption) return;
    setCurrentStep(2);
    simulateZKProofGeneration();
  };

  const simulateZKProofGeneration = () => {
    setIsGenerating(true);
    const logMessages = [
      "Loading ZK circuit...",
      "Circuit loaded",
      "Generating witness...",
      "Witness generated",
      "Computing proof...",
      "Proof generated successfully",
    ];

    logMessages.forEach((msg, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, msg]);
        if (index === logMessages.length - 1) {
          setIsGenerating(false);
          setTimeout(() => setCurrentStep(3), 500);
        }
      }, index * 1500);
    });
  };

  const handleSubmitVote = () => {
    setTimeout(() => {
      setCurrentStep(4);
    }, 1000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast({
      title: "Hash copied",
      description: "Transaction hash has been copied to clipboard.",
    });
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedOption("");
    setLogs([]);
    setIsGenerating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-glacier-slate"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
            <DialogTitle className="text-center flex-1">
              Paso {currentStep + 1} de {STEPS.length}
            </DialogTitle>
            <div className="w-20" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />

          <div className="flex justify-center gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index <= currentStep ? "text-primary" : "text-glacier-mist"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary text-white"
                      : "bg-glacier-ice text-glacier-mist"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? "bg-primary" : "bg-glacier-line"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {currentStep === 0 && (
            <div className="text-center space-y-6 py-8">
              <Shield className="w-16 h-16 mx-auto text-primary" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Verify Eligibility
                </h3>
                <p className="text-glacier-slate">
                  To participate in this election, we need to verify your wallet.
                </p>
              </div>

              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-glacier-slate">
                    Privacy guaranteed
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-glacier-slate">
                    Without revealing your identity
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm text-glacier-slate">
                    Zero-knowledge proof technology
                  </span>
                </div>
              </div>

              <Button onClick={handleVerifyEligibility} size="lg">
                Verify and Continue
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <h3 className="text-xl font-semibold">Select your option</h3>
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                <div className="space-y-3">
                  {["Option A: Candidate John P.", "Option B: Candidate Maria S.", "Option C: Blank Vote"].map(
                    (option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-3 p-4 rounded-smooth border-2 transition-all cursor-pointer ${
                          selectedOption === option
                            ? "border-primary bg-primary/5"
                            : "border-glacier-line hover:border-glacier-mist"
                        }`}
                        onClick={() => setSelectedOption(option)}
                      >
                        <RadioGroupItem value={option} id={option} />
                        <Label
                          htmlFor={option}
                          className="flex-1 cursor-pointer font-medium"
                        >
                          {option}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </RadioGroup>
              <Button
                onClick={handleSelectOption}
                disabled={!selectedOption}
                size="lg"
                className="w-full"
              >
                Next: Generate Proof
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Generando Prueba Criptográfica
                </h3>
                <p className="text-sm text-glacier-slate">
                  Este proceso puede tomar 30-60s. No cierres esta ventana.
                </p>
              </div>

              <div className="bg-glacier-ice rounded-smooth p-4 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-glacier-slate"
                  >
                    {index < logs.length - 1 || !isGenerating ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <Progress
                value={(logs.length / 6) * 100}
                className="h-2"
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 py-4">
              <h3 className="text-xl font-semibold">Confirm Your Vote</h3>
              <div className="bg-glacier-ice rounded-smooth p-6 space-y-4">
                <div>
                  <p className="text-sm text-glacier-mist mb-1">Election</p>
                  <p className="font-medium">{electionTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-glacier-mist mb-1">Your vote</p>
                  <p className="font-medium text-primary">{selectedOption}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-glacier-slate">
                    Anonymous and verifiable
                  </span>
                </div>
              </div>
              <p className="text-sm text-glacier-slate text-center">
                By submitting, your vote will be recorded on the blockchain 
                immutably and privately.
              </p>
              <Button onClick={handleSubmitVote} size="lg" className="w-full">
                🗳️ Cast Vote
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center animate-checkmark">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-green-600">
                  Vote Registered!
                </h3>
                <p className="text-glacier-slate">
                  Your vote has been cast and confirmed on the blockchain.
                </p>
              </div>

              <div className="bg-glacier-ice rounded-smooth p-4 space-y-2">
                <p className="text-sm text-glacier-mist">Transaction Hash</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm font-mono">{txHash}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyHash}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  View on Explorer
                </Button>
                <Button onClick={handleClose} className="w-full">
                  Back to Elections
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
