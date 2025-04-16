"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-4xl font-light text-center mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 font-light">
          Get unlimited access to rare games and instant price alerts
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border rounded-[30px] p-8 bg-white">
            <h2 className="text-2xl font-light mb-2">Free</h2>
            <p className="text-muted-foreground mb-6 font-light">Perfect for casual collectors</p>
            <div className="text-3xl font-light mb-8">$0<span className="text-base text-muted-foreground">/month</span></div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>5 Searches per day</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>1 Saved alert</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>10 Favorites</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Trending games feed</span>
              </div>
            </div>

            <Button variant="outline" className="w-full font-light">
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-black rounded-[30px] p-8 bg-white relative overflow-hidden">
            <div className="absolute top-6 right-6 bg-black text-white px-3 py-1 rounded-full text-sm font-light">
              Popular
            </div>
            
            <h2 className="text-2xl font-light mb-2">Pro</h2>
            <p className="text-muted-foreground mb-6 font-light">For serious collectors</p>
            <div className="text-3xl font-light mb-8">$5.99<span className="text-base text-muted-foreground">/month</span></div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Unlimited searches</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Unlimited price alerts</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Instant notifications</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Portfolio value tracking</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Advanced filters</span>
              </div>
              <div className="flex items-center gap-2 font-light">
                <Check className="h-5 w-5 text-green-500" />
                <span>Price history graphs</span>
              </div>
            </div>

            <Button className="w-full bg-black hover:bg-black/90 text-white font-light">
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-light mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground font-light">Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="text-lg font-light mb-2">How do instant alerts work?</h3>
              <p className="text-muted-foreground font-light">Pro members receive real-time notifications when items matching their saved searches appear or when prices drop below their target price.</p>
            </div>
            <div>
              <h3 className="text-lg font-light mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground font-light">We accept all major credit cards and PayPal. Your payment information is securely processed by Stripe.</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 