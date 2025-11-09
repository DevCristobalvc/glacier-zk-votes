import { useState } from "react";
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";
import { VotingModal } from "@/components/VotingModal";
import { SimpleVote } from "@/components/SimpleVote";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle2, Zap, TrendingUp, Users } from "lucide-react";

const Index = () => {
  const [votingModalOpen, setVotingModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState("");

  const handleVote = (electionTitle: string) => {
    setSelectedElection(electionTitle);
    setVotingModalOpen(true);
  };

  const elections = [
    {
      id: 1,
      title: "Representative Election 2025",
      status: "active" as const,
      endDate: "3 days",
      voteCount: 243,
    },
    {
      id: 2,
      title: "Fiscal Reform Q2",
      status: "upcoming" as const,
      startDate: "15 Nov 2025",
    },
    {
      id: 3,
      title: "Presupuesto Anual 2024",
      status: "closed" as const,
      voteCount: 1829,
    },
  ];

  const stats = [
    { value: "1,200+", label: "Votos Emitidos", icon: TrendingUp },
    { value: "100%", label: "Privacidad", icon: Shield },
    { value: "500+", label: "Participantes", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Mejorado con gradientes y mesh */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden gradient-mesh">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="animate-slide-up">
            {/* Top badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <Zap className="w-4 h-4" />
              Zero-Knowledge Technology on Avalanche
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-foreground leading-tight">
              Private{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Voting
              </span>{" "}
              and Verifiable
            </h1>
            
            <p className="text-xl sm:text-2xl text-glacier-slate mb-10 max-w-3xl mx-auto leading-relaxed">
              Cast your vote completely anonymously using zero-knowledge proofs. 
              Your identity remains private, but your vote is verifiable on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-10 py-7 h-auto shadow-red-accent hover:shadow-red-accent text-base font-semibold group"
                onClick={() => {
                  document
                    .getElementById("elections")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Active Elections
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 h-auto text-base font-semibold"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                How It Works
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-glacier-line hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary mb-4 group-hover:animate-float">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-glacier-slate font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-glacier-ice">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Glacier?
            </h2>
            <p className="text-xl text-glacier-slate max-w-2xl mx-auto">
              The most advanced platform for private and verifiable voting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative p-8 rounded-2xl bg-white border border-glacier-line hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-6 left-8">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-red-accent group-hover:animate-float">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3">Total Privacy</h3>
                <p className="text-glacier-slate leading-relaxed">
                  Your vote is completely anonymous thanks to zero-knowledge 
                  proofs (ZK-SNARKs). No one can trace your identity.
                </p>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl bg-white border border-glacier-line hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-6 left-8">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-red-accent group-hover:animate-float" style={{ animationDelay: "0.1s" }}>
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3">
                  Fully Verifiable
                </h3>
                <p className="text-glacier-slate leading-relaxed">
                  Every vote is recorded on the Avalanche blockchain in an 
                  immutable and auditable way by all participants.
                </p>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl bg-white border border-glacier-line hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-6 left-8">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-red-accent group-hover:animate-float" style={{ animationDelay: "0.2s" }}>
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3">Maximum Security</h3>
                <p className="text-glacier-slate leading-relaxed">
                  Decentralized infrastructure on Avalanche that guarantees 
                  electoral process integrity and prevents any fraud.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Election - LIVE VOTING */}
      <section id="elections" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-600 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              LIVE DEMO
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Community DAO Governance Vote
            </h2>
            <p className="text-xl text-glacier-slate max-w-2xl mx-auto mb-8">
              Vote anonymously on the next protocol upgrade. Your identity stays private, but your vote counts.
            </p>
          </div>

          {/* Import and use SimpleVote component here */}
          <div className="max-w-2xl mx-auto">
            <SimpleVote 
              electionId={0}
              options={[
                "Option A: Implement Cross-Chain Bridge",
                "Option B: Reduce Governance Fees",
                "Option C: Increase Staking Rewards"
              ]}
            />
          </div>

          {/* Stats below vote */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-glacier-ice">
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="text-sm text-glacier-slate">Total Votes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-glacier-ice">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-glacier-slate">Anonymous</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-glacier-ice">
              <div className="text-2xl font-bold text-foreground">2 days</div>
              <div className="text-sm text-glacier-slate">Remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Mejorado */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-glacier-ice">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-glacier-slate">
              A simple and secure process in 4 steps
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Connect Your Wallet",
                description:
                  "Connect your Avalanche wallet to verify your eligibility in the election without revealing your identity.",
              },
              {
                step: "2",
                title: "Select Your Option",
                description:
                  "Choose your preferred option among the available alternatives in the election privately.",
              },
              {
                step: "3",
                title: "ZK Proof Generation",
                description:
                  "The system automatically generates a cryptographic proof that guarantees your anonymity without compromising validity.",
              },
              {
                step: "4",
                title: "Vote Confirmed",
                description:
                  "Your vote is recorded on the blockchain immutably, privately and fully verifiable by everyone.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group flex gap-6 p-8 rounded-2xl bg-white border border-glacier-line hover:border-primary/30 transition-all duration-300 hover:-translate-x-2 hover:shadow-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-red-accent group-hover:animate-float">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-glacier-slate leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Mejorado */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-glacier-line bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/assets/glacier-logo.png" alt="Glacier" className="h-10 w-auto" />
            </div>
            <p className="text-sm text-glacier-slate text-center md:text-left">
              © 2025 Glacier. Private and verifiable voting on Avalanche.
              <br className="md:hidden" />
              Built with zero-knowledge technology.
            </p>
          </div>
        </div>
      </footer>

      <VotingModal
        open={votingModalOpen}
        onOpenChange={setVotingModalOpen}
        electionTitle={selectedElection}
      />
    </div>
  );
};

export default Index;
