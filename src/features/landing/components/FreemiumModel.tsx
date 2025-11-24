import { Zap, Lock, Target } from 'lucide-react';

export const FreemiumModel = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Pourquoi Commencer Anonymement ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Nous savons que les inscriptions peuvent être un frein. C'est pourquoi nous avons choisi une approche différente.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-semibold">Accès instantané</h4>
                  <p className="text-muted-foreground">Commencez à utiliser la plateforme en moins de 10 secondes</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-semibold">Vie privée respectée</h4>
                  <p className="text-muted-foreground">Vos données restent anonymes tant que vous le souhaitez</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-semibold">Payez seulement si convaincu</h4>
                  <p className="text-muted-foreground">Inscription uniquement quand vous voulez débloquer les fonctionnalités premium</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative lg:ml-auto">
            <div className="bg-card border rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Comment ça marche</h3>
              <ol className="relative border-l border-muted ml-3 space-y-8">
                <li className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                    1
                  </span>
                  <h4 className="text-lg font-semibold">Cliquez et commencez</h4>
                  <p className="text-muted-foreground">Accès direct aux fonctionnalités gratuites</p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                    2
                  </span>
                  <h4 className="text-lg font-semibold">Explorez sans limite</h4>
                  <p className="text-muted-foreground">Testez toutes les fonctionnalités de base</p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                    3
                  </span>
                  <h4 className="text-lg font-semibold">Inscription à la demande</h4>
                  <p className="text-muted-foreground">Créez un compte seulement si vous voulez plus</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
