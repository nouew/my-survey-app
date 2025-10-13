
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
import {
  countries,
  states,
  ProfileData,
  genders,
  maritalStatuses,
  educationLevels,
  employmentStatuses,
  ethnicities,
} from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { UserCircle2 } from "lucide-react";

interface ProfileFormProps {
  onSave: (data: ProfileData) => void;
  initialProfile: ProfileData | null;
  lang: Language;
  storageKey: string;
}

export function ProfileForm({ 
  onSave, 
  lang,
  storageKey,
}: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const { toast } = useToast();
  const t = translations[lang];

  const profileSchema = z.object({
    income: z.string().min(1, t.profile.errors.income),
    occupation: z.string().min(1, t.profile.errors.occupation),
    country: z.string().min(1, t.profile.errors.country),
    state: z.string().min(1, t.profile.errors.state),
    gender: z.string().min(1, t.profile.errors.gender),
    dob: z.string().min(1, t.profile.errors.dob),
    maritalStatus: z.string().min(1, t.profile.errors.maritalStatus),
    education: z.string().min(1, t.profile.errors.education),
    employment: z.string().min(1, t.profile.errors.employment),
    ethnicity: z.string().min(1, t.profile.errors.ethnicity),
  });
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      income: "",
      occupation: "",
      country: "",
      state: "",
      gender: "",
      dob: "",
      maritalStatus: "",
      education: "",
      employment: "",
      ethnicity: "",
    },
  });

  // Effect to load data from localStorage ONLY on component mount
  useEffect(() => {
    const savedDataString = localStorage.getItem(storageKey);
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        form.reset(savedData);
        setSelectedCountry(savedData.country || "");
        setIsEditing(false); // Start in non-editing mode
      } catch (e) {
        console.error("Failed to parse profile from storage", e);
        setIsEditing(true); // If parsing fails, start in editing mode
      }
    } else {
      setIsEditing(true); // If no data, start in editing mode
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  
  useEffect(() => {
    const subscription = form.watch((value) => {
        if(value.country) {
            setSelectedCountry(value.country);
        }
    });
    return () => subscription.unsubscribe();
  }, [form]);


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
    form.setValue("state", "");
  };
  
  const handleCancel = () => {
    form.reset(); // Reset to the last committed form state (from last successful load or submit)
    setIsEditing(false);
  }

  const handleEdit = () => {
    setIsEditing(true);
  }

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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All FormField components are the same, just with the disabled prop bound to !isEditing */}
            <FormField
              control={form.control}
              name="income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.income}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., $50,000"
                      {...field}
                      disabled={!isEditing}
                    />
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
                    <Input
                      placeholder="e.g., Software Engineer"
                      {...field}
                      disabled={!isEditing}
                    />
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
                    value={field.value}
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
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.gender}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                     dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectGender} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {lang === "ar" ? (g.value === "male" ? "ذكر" : g.value === "female" ? "أنثى" : g.value === "non-binary" ? "غير ثنائي" : "أفضل عدم القول") : g.label}
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
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.dob}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.maritalStatus}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                     dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectMaritalStatus} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maritalStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {lang === 'ar' ? (s.value === 'single' ? 'أعزب' : s.value === 'married' ? 'متزوج' : s.value === 'divorced' ? 'مطلق' : 'أرمل') : s.label}
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
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.education}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                     dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectEducation} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {educationLevels.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                           {lang === 'ar' ? (e.value === 'high_school' ? 'ثانوية عامة أو أقل' : e.value === 'some_college' ? 'بعض التعليم الجامعي' : e.value === 'associates' ? 'شهادة دبلوم' : e.value === 'bachelors' ? 'شهادة بكالوريوس' : e.value === 'masters' ? 'شهادة ماجستير' : 'دكتوراه أو أعلى') : e.label}
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
              name="employment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.employment}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                     dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectEmployment} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employmentStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                           {lang === 'ar' ? (s.value === 'employed_full_time' ? 'موظف بدوام كامل' : s.value === 'employed_part_time' ? 'موظف بدوام جزئي' : s.value === 'self_employed' ? 'صاحب عمل حر' : s.value === 'unemployed' ? 'عاطل عن العمل' : s.value === 'student' ? 'طالب' : 'متقاعد') : s.label}
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
              name="ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.ethnicity}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                     dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.profile.selectEthnicity} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ethnicities.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                           {lang === 'ar' ? (e.value === 'white' ? 'أبيض' : e.value === 'hispanic_latino' ? 'من أصل إسباني أو لاتيني' : e.value === 'black_african_american' ? 'أسود أو أمريكي من أصل أفريقي' : e.value === 'asian' ? 'آسيوي' : e.value === 'native_american_alaskan_native' ? 'هندي أمريكي أو من سكان ألاسكا الأصليين' : e.value === 'middle_eastern_north_african' ? 'شرق أوسطي أو شمال أفريقي' : e.value === 'native_hawaiian_pacific_islander' ? 'من سكان هاواي الأصليين أو من جزر المحيط الهادئ الأخرى' : 'آخر') : e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            {isEditing ? (
              <>
                <Button type="submit">{t.profile.save}</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                >
                  {t.profile.cancel}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleEdit}>
                {t.profile.edit}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    