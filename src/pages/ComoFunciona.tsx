import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

const ComoFunciona = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Como Funciona</h1>
          <p className="text-muted-foreground">Entenda o passo a passo da catira</p>
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default ComoFunciona;
