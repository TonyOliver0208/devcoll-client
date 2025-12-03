"use client";

import { useEditorStore } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  CheckCircle,
  Clock,
  Crown,
  Loader2,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { createPaypalOrder } from "@/services/subscription-service";
import { useState } from "react";

function SubscriptionModal({ isOpen, onClose }) {
  const { userSubscription } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    const response = await createPaypalOrder();

    if (response.success) {
      window.location.href = response.data.approvalLink;
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={"sm:max-w-[900px] p-0 gap-0 overflow-hidden"}>
        <div className="flex flex-col md:flex-row">
          <div className="p-6 flex-1">
            {userSubscription?.isPremium ? (
              <>
                <DialogTitle
                  className={"text-2xl font-bold mb-4 flex items-center"}
                >
                  <Crown className="h-6 w-6 text-[#F48024] mr-2" />
                  You're a Premium Member!
                </DialogTitle>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-[#F48024] mr-2" />
                    <p className="text-gray-700 font-medium">
                      Premium active since{" "}
                      {new Date(
                        userSubscription?.premiumSince
                      ).toLocaleDateString() || "recently"}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-6 text-gray-600">
                  You have full access to all premium features and benefits!
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Crown className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Unlimited Designs</p>
                      <p className="text-sm text-gray-600">
                        Create as many designs as you want with no limits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Palette className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Premium Templates</p>
                      <p className="text-sm text-gray-600">
                        Access exclusive templates and design assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Clock className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Advanced Tools</p>
                      <p className="text-sm text-gray-600">
                        Time-saving features for professional results
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogTitle
                  className={"text-2xl font-bold mb-4 flex items-center"}
                >
                  <Crown className="h-6 w-6 text-[#F48024] mr-2" />
                  Upgrade To DevColl Premium
                </DialogTitle>
                <p className="text-sm mb-4 text-gray-600">
                  Unlock unlimited designs and access professional tools to create quality content for your developer community
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Crown className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Unlimited Designs</p>
                      <p className="text-sm text-gray-600">
                        Create as many designs as you want with no limits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Palette className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Premium Templates</p>
                      <p className="text-sm text-gray-600">
                        Access exclusive templates and design assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Clock className="h-5 w-5 text-[#F48024] mr-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Advanced Tools</p>
                      <p className="text-sm text-gray-600">
                        Time-saving features for professional results
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Button
                    className={"w-full bg-gradient-to-r from-[#F48024] to-[#ff7a45] hover:from-[#ff7a45] hover:to-[#F48024] text-white"}
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-5 h-5" />
                        Upgrade to Premium - $9.99/month
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="hidden md:block md:w-[450px] bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="relative">
                    <Crown className="h-24 w-24 text-[#F48024]" />
                    <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Go Premium Today
                </h3>
                <p className="text-gray-600 text-base">
                  Join thousands of developers creating professional designs
                </p>
                <div className="flex justify-center gap-2 items-center">
                  <div className="h-2 w-2 rounded-full bg-[#F48024] animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionModal;
