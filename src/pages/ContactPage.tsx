import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { companyInfo } from '../data/company';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Headphones
} from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Message Envoyé !
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              Envoyer un Autre Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Contactez-Nous
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Notre équipe d'experts est là pour répondre à toutes vos questions sur nos services d'investissement crypto.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Envoyez-nous un Message
                    </h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nom Complet"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                      />
                      <Input
                        label="Adresse Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        icon={<Mail className="h-5 w-5" />}
                      />
                    </div>

                    <Input
                      label="Sujet"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Sujet de votre message"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Décrivez votre demande en détail..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isSubmitting}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer le Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Informations de Contact
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email</p>
                      <p className="text-slate-600 dark:text-slate-400">{companyInfo.contact.email}</p>
                      <p className="text-slate-600 dark:text-slate-400">{companyInfo.contact.support}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Téléphone</p>
                      <p className="text-slate-600 dark:text-slate-400">{companyInfo.contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Adresse</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {companyInfo.contact.address.street}<br />
                        {companyInfo.contact.address.postalCode} {companyInfo.contact.address.city}<br />
                        {companyInfo.contact.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Horaires</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Lun - Ven : 9h00 - 18h00<br />
                        Sam - Dim : 10h00 - 16h00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Options */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Options de Support
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Support 24/7</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Chat en direct disponible</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Gestionnaire Dédié</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Pour les comptes Premium</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Centre d'Aide</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">FAQ et guides détaillés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Phone className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      Urgence Sécurité
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      Pour les problèmes de sécurité urgents
                    </p>
                    <p className="font-mono text-orange-900 dark:text-orange-100">
                      +33 1 75 43 88 99
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}