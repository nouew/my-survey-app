"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { countries, states, ProfileData } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { UserCircle2 } from "lucide-react";

interface ProfileFormProps {
  onSave: (data: ProfileData) => void;
  initialProfile: ProfileData | null;
  lang: Language;
}

export function ProfileForm({ onSave, initialProfile, lang }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(!initialProfile);
  const [selectedCountry, setSelectedCountry] = useState(
    initialProfile?.country || ""
  );
  const { toast } = useToast();
  const t = translations[lang];

  const profileSchema = z.object({
    income: z.string().min(1, t.profile.errors.income),
    occupation: z.string().min(1, t.profile.errors.occupation),
    technology: z.string().min(1, t.profile.errors.technology),
    country: z.string().min(1, t.profile.errors.country),
    state: z.string().min(1, t.profile.errors.state),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      income: "",
      occupation: "",
      technology: "",
      country: "",
      state: "",
    },
  });

  useEffect(() => {
    if (initialProfile) {
      form.reset(initialProfile);
      setSelectedCountry(initialProfile.country);
      setIsEditing(false);
    } else {
        setIsEditing(true);
    }
  }, [initialProfile, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    onSave(data);
    setIsEditing(false);
    toast({
      title: t.profile.toast.title,
      description: t.profile.toast.description,
    });
  };

  const handleCountryChange = (countryValue: string) => {
    setSelectedCountry(countryValue);
    form.setValue("country", countryValue);
    form.setValue("state", ""); // Reset state when country changes
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="text-primary" />
              {t.profile.title}
            </CardTitle>
            <CardDescription>{t.profile.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.income}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $50,000" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.occupation}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.technology}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Python" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.country}</FormLabel>
                  <Select
                    onValueChange={handleCountryChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectCountry} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.state}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing || !selectedCountry}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectState} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedCountry &&
                        states[selectedCountry]?.map((s) => (
                          <SelectItem key={s.code} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            {isEditing ? (
              <Button type="submit">{t.profile.save}</Button>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                {t.profile.edit}
              </Button>
            )}
             {isEditing && initialProfile && (
                <Button type="button" variant="ghost" onClick={() => {
                    form.reset(initialProfile);
                    setSelectedCountry(initialProfile.country);
                    setIsEditing(false);
                }}>
                    {t.profile.cancel}
                </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
